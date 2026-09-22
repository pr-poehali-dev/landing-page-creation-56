import json
import os
import calendar
from datetime import datetime, date, timedelta
import psycopg2

STATUS_LABELS = {
    'new': 'Новая', 'estimate': 'Смета', 'contract': 'Договор',
    'payment': 'Оплата', 'live': 'Размещение', 'completed': 'Завершена', 'lost': 'Потеряна',
}


def log_event(cur, lead_id, event_type, details):
    text = str(details or '')[:500].replace("'", "''")
    cur.execute(
        f"INSERT INTO lead_events (lead_id, event_type, details) "
        f"VALUES ({int(lead_id)}, '{event_type}', '{text}')"
    )


PLAN_STATUSES = ('contract', 'payment', 'live', 'completed')

TRASH_DAYS = 30


def actor(event, cur):
    """Определяет сотрудника по токену сессии"""
    headers = event.get('headers') or {}
    token = headers.get('X-Session-Token') or headers.get('x-session-token')
    if not token:
        return None
    safe = str(token).replace("'", "''")
    cur.execute(
        "SELECT s.staff_id, st.name, st.role FROM staff_sessions s "
        "JOIN staff st ON st.id = s.staff_id "
        f"WHERE s.token = '{safe}' AND s.revoked = FALSE "
        "AND s.expires_at > CURRENT_TIMESTAMP AND st.active = TRUE"
    )
    r = cur.fetchone()
    return {'id': r[0], 'name': r[1], 'role': r[2]} if r else None


def who_ip(event):
    req = event.get('requestContext') or {}
    ident = req.get('identity') or {}
    raw = event.get('headers') or {}
    fwd = raw.get('X-Forwarded-For') or raw.get('x-forwarded-for') or ''
    return ((fwd.split(',')[0].strip() if fwd else '') or ident.get('sourceIp') or '')[:45]


def allowed(event, cur):
    """Пускает по мастер-паролю ИЛИ по активной сессии сотрудника"""
    master = os.environ.get('ADMIN_KEY', '')
    headers = event.get('headers') or {}
    provided = headers.get('X-Admin-Key') or headers.get('x-admin-key', '')
    if master and provided == master:
        return True
    return actor(event, cur) is not None


def audit(cur, staff, event, action, entity=None, entity_id=None,
          details=None, severity='info'):
    name = staff['name'] if staff else None
    sid = staff['id'] if staff else 'NULL'
    text = str(details)[:580].replace("'", "''") if details else None
    cur.execute(
        "INSERT INTO audit_log (staff_id, staff_name, action, entity, entity_id, "
        "details, ip, severity) VALUES ("
        f"{sid}, {esc_sql(name)}, {esc_sql(action)}, {esc_sql(entity)}, "
        f"{int(entity_id) if entity_id else 'NULL'}, "
        f"{('NULL' if text is None else chr(39) + text + chr(39))}, "
        f"{esc_sql(who_ip(event))}, {esc_sql(severity)})"
    )


def mask_phone(phone):
    """Прячет середину номера: +7 (924) ***-**-95"""
    if not phone:
        return phone
    digits = [c for c in str(phone) if c.isdigit()]
    if len(digits) < 6:
        return '***'
    return f"+{digits[0]} ({''.join(digits[1:4])}) ***-**-{''.join(digits[-2:])}"


def to_trash(cur, staff, entity, entity_id, title, payload):
    blob = json.dumps(payload, ensure_ascii=False, default=str).replace("'", "''")
    cur.execute(
        "INSERT INTO trash_bin (entity, entity_id, title, payload, removed_by, restore_until) "
        f"VALUES ({esc_sql(entity)}, {int(entity_id)}, {esc_sql(str(title)[:240])}, "
        f"'{blob}', {esc_sql(staff['name'] if staff else None)}, "
        f"CURRENT_DATE + {TRASH_DAYS})"
    )


def esc_sql(v):
    if v is None or v == '':
        return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"


def sync_placements(cur, lead_id):
    """Пересобирает строки медиаплана для сделки по её условиям размещения"""
    cur.execute(
        "SELECT name, company, status, start_date, end_date, duration, "
        "placement_amount, total_price, paid_amount "
        f"FROM leads WHERE id = {int(lead_id)}"
    )
    row = cur.fetchone()
    cur.execute(f"DELETE FROM placements WHERE lead_id = {int(lead_id)}")

    if not row:
        return 0

    name, company, status, start, end, duration, placement_amount, total_price, paid = row
    if status not in PLAN_STATUSES or not start or not end or end < start:
        return 0

    brand = (company or name or '').strip()[:250]
    if not brand:
        return 0

    dur = int(duration or 0)
    amount_total = int(placement_amount or total_price or 0)
    days_total = (end - start).days + 1
    pay_type = 'paid' if (total_price and paid and paid >= total_price) else 'unpaid'

    period_text = f"{start.strftime('%d.%m.%Y')}-{end.strftime('%d.%m.%Y')}"

    created = 0
    cur_month = date(start.year, start.month, 1)
    while cur_month <= end:
        days_in_month = calendar.monthrange(cur_month.year, cur_month.month)[1]
        m_end = date(cur_month.year, cur_month.month, days_in_month)
        seg_from = start if start > cur_month else cur_month
        seg_to = end if end < m_end else m_end
        seg_days = (seg_to - seg_from).days + 1

        secs = [0] * days_in_month
        for d in range(seg_from.day, seg_to.day + 1):
            secs[d - 1] = dur
        sec_str = ','.join(str(x) for x in secs)

        amount_month = round(amount_total / days_total * seg_days) if days_total else 0

        cur.execute(
            "INSERT INTO placements (lead_id, plan_year, plan_month, brand, legal_entity, "
            "payment_type, video_status, duration_sec, period_text, start_day, end_day, "
            "days_count, price_total, amount_month, day_seconds) VALUES ("
            f"{int(lead_id)}, {cur_month.year}, {cur_month.month}, {esc_sql(brand)}, "
            f"{esc_sql(company)}, '{pay_type}', 'ready', {dur}, {esc_sql(period_text)}, "
            f"{seg_from.day}, {seg_to.day}, {seg_days}, {amount_total}, {amount_month}, "
            f"{esc_sql(sec_str)})"
        )
        created += 1
        cur_month = date(cur_month.year + (cur_month.month == 12),
                         (cur_month.month % 12) + 1, 1)

    return created


def handler(event: dict, context) -> dict:
    """Приём заявок с сайта Флэшборд и получение списка заявок для админки"""
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        'Access-Control-Max-Age': '86400'
    }

    valid_statuses = {'new', 'estimate', 'contract', 'payment', 'live', 'completed', 'lost'}

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        name = str(body.get('name', ''))[:255]
        phone = str(body.get('phone', ''))[:50]
        comment = str(body.get('comment', ''))[:2000]
        duration = body.get('duration')
        days = body.get('days')
        need_video = bool(body.get('needVideo', False))
        total_price = body.get('totalPrice')
        source = str(body.get('source', 'form'))[:50]

        if not name or not phone:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Имя и телефон обязательны'}, ensure_ascii=False),
                'isBase64Encoded': False
            }

        name_esc = name.replace("'", "''")
        phone_esc = phone.replace("'", "''")
        comment_esc = comment.replace("'", "''")
        source_esc = source.replace("'", "''")
        dur_val = int(duration) if duration else 'NULL'
        days_val = int(days) if days else 'NULL'
        price_val = int(total_price) if total_price else 'NULL'

        company = str(body.get('company', ''))[:255]
        company_esc = company.replace("'", "''")
        company_val = f"'{company_esc}'" if company else 'NULL'

        email = str(body.get('email', ''))[:255]
        email_esc = email.replace("'", "''")
        email_val = f"'{email_esc}'" if email else 'NULL'

        consent_given = bool(body.get('consent', False))
        consent_val = 'NULL'
        consent_ip_val = 'NULL'
        consent_text_val = 'NULL'
        if consent_given and source == 'form':
            req_ctx = event.get('requestContext') or {}
            identity = req_ctx.get('identity') or {}
            raw_headers = event.get('headers') or {}
            fwd = raw_headers.get('X-Forwarded-For') or raw_headers.get('x-forwarded-for') or ''
            client_ip = (fwd.split(',')[0].strip() if fwd else '') or identity.get('sourceIp') or ''
            client_ip = client_ip[:45].replace("'", "")
            consent_text = str(body.get('consentText', ''))[:1000].replace("'", "''")
            consent_val = 'CURRENT_TIMESTAMP'
            consent_ip_val = f"'{client_ip}'" if client_ip else 'NULL'
            consent_text_val = f"'{consent_text}'" if consent_text else 'NULL'

        start_raw = str(body.get('startDate') or '')[:10]
        start_val = 'NULL'
        if start_raw:
            try:
                datetime.strptime(start_raw, '%Y-%m-%d')
                start_val = f"'{start_raw}'"
            except ValueError:
                start_val = 'NULL'

        query = (
            f"INSERT INTO leads (name, phone, comment, duration, days, need_video, total_price, source, company, email, start_date, "
            f"consent_at, consent_ip, consent_text) "
            f"VALUES ('{name_esc}', '{phone_esc}', '{comment_esc}', {dur_val}, {days_val}, "
            f"{'TRUE' if need_video else 'FALSE'}, {price_val}, '{source_esc}', {company_val}, {email_val}, {start_val}, "
            f"{consent_val}, {consent_ip_val}, {consent_text_val}) RETURNING id"
        )
        cur.execute(query)
        lead_id = cur.fetchone()[0]
        log_event(cur, lead_id, 'created',
                  'Добавлена вручную' if source == 'manual' else 'Заявка с сайта')
        if consent_given and source == 'form':
            log_event(cur, lead_id, 'consent',
                      f"Согласие на обработку персональных данных получено. IP: {client_ip or 'не определён'}")
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'id': lead_id}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    if method == 'GET':
        admin_key = os.environ.get('ADMIN_KEY', '')
        headers = event.get('headers', {})
        provided = headers.get('X-Admin-Key') or headers.get('x-admin-key', '')

        if not allowed(event, cur):
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Доступ запрещён'}, ensure_ascii=False),
                'isBase64Encoded': False
            }

        cur.execute(
            "SELECT id, name, phone, comment, duration, days, need_video, total_price, "
            "source, status, created_at, company, start_date, end_date, placement_amount, video_amount, "
            "inn, kpp, ogrn, legal_address, bank_name, bank_account, bank_bik, bank_corr_account, "
            "signer_name, signer_position, paid_amount, email, consent_at, consent_ip, consent_text "
            "FROM leads ORDER BY created_at DESC LIMIT 200"
        )
        rows = cur.fetchall()
        viewer = actor(event, cur)
        params_get = event.get('queryStringParameters') or {}
        reveal_id = params_get.get('revealPhone')
        reveal = int(reveal_id) if reveal_id and str(reveal_id).isdigit() else None
        if reveal and viewer:
            cur.execute(f"SELECT name, company FROM leads WHERE id = {reveal}")
            who = cur.fetchone()
            audit(cur, viewer, event, 'phone_revealed', 'lead', reveal,
                  f"Открыт телефон: {(who[1] or who[0]) if who else reveal}", 'warning')
            conn.commit()

        leads = [{
            'id': r[0], 'name': r[1],
            'phone': r[2] if (reveal == r[0] or not viewer) else mask_phone(r[2]),
            'phoneHidden': not (reveal == r[0] or not viewer),
            'comment': r[3],
            'duration': r[4], 'days': r[5], 'needVideo': r[6], 'totalPrice': r[7],
            'source': r[8], 'status': r[9],
            'createdAt': r[10].isoformat() if r[10] else None,
            'company': r[11],
            'startDate': r[12].isoformat() if r[12] else None,
            'endDate': r[13].isoformat() if r[13] else None,
            'placementAmount': r[14], 'videoAmount': r[15],
            'inn': r[16], 'kpp': r[17], 'ogrn': r[18], 'legalAddress': r[19],
            'bankName': r[20], 'bankAccount': r[21], 'bankBik': r[22], 'bankCorrAccount': r[23],
            'signerName': r[24], 'signerPosition': r[25],
            'paidAmount': r[26] or 0,
            'email': r[27],
            'consentAt': r[28].isoformat() if r[28] else None,
            'consentIp': r[29],
            'consentText': r[30],
            'documents': [], 'events': [], 'payments': []
        } for r in rows]

        cur.execute(
            "SELECT id, lead_id, doc_type, file_url, doc_no, created_at "
            "FROM lead_documents ORDER BY created_at DESC"
        )
        doc_rows = cur.fetchall()
        docs_by_lead = {}
        for dr in doc_rows:
            docs_by_lead.setdefault(dr[1], []).append({
                'id': dr[0], 'type': dr[2], 'url': dr[3], 'no': dr[4],
                'createdAt': dr[5].isoformat() if dr[5] else None
            })
        for lead in leads:
            lead['documents'] = docs_by_lead.get(lead['id'], [])

        cur.execute(
            "SELECT lead_id, event_type, details, created_at "
            "FROM lead_events ORDER BY created_at DESC, id DESC"
        )
        events_by_lead = {}
        for er in cur.fetchall():
            events_by_lead.setdefault(er[0], []).append({
                'type': er[1], 'details': er[2],
                'createdAt': er[3].isoformat() if er[3] else None
            })
        for lead in leads:
            lead['events'] = events_by_lead.get(lead['id'], [])

        cur.execute(
            "SELECT id, lead_id, due_date, amount, comment, is_paid, paid_at, sort_order "
            "FROM lead_payments ORDER BY lead_id, sort_order, due_date"
        )
        pays_by_lead = {}
        for pr in cur.fetchall():
            pays_by_lead.setdefault(pr[1], []).append({
                'id': pr[0],
                'dueDate': pr[2].isoformat() if pr[2] else None,
                'amount': pr[3],
                'comment': pr[4],
                'isPaid': pr[5],
                'paidAt': pr[6].isoformat() if pr[6] else None,
                'sortOrder': pr[7],
            })
        for lead in leads:
            lead['payments'] = pays_by_lead.get(lead['id'], [])

        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'leads': leads}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    if method == 'PATCH':
        admin_key = os.environ.get('ADMIN_KEY', '')
        headers = event.get('headers', {})
        provided = headers.get('X-Admin-Key') or headers.get('x-admin-key', '')

        if not allowed(event, cur):
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Доступ запрещён'}, ensure_ascii=False),
                'isBase64Encoded': False
            }

        body = json.loads(event.get('body', '{}'))
        lead_id = body.get('id')

        if not lead_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'id обязателен'}, ensure_ascii=False),
                'isBase64Encoded': False
            }

        set_clauses = []

        cur.execute(f"SELECT status, paid_amount, total_price FROM leads WHERE id = {int(lead_id)}")
        prev_row = cur.fetchone()
        prev_status = prev_row[0] if prev_row else None
        prev_paid = (prev_row[1] or 0) if prev_row else 0

        if 'status' in body:
            status = body.get('status')
            if status not in valid_statuses:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Недопустимый статус'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            set_clauses.append(f"status = '{status.replace(chr(39), chr(39)*2)}'")

        requisite_fields = {
            'company': 'company', 'inn': 'inn', 'kpp': 'kpp', 'ogrn': 'ogrn',
            'email': 'email',
            'legalAddress': 'legal_address', 'bankName': 'bank_name', 'bankAccount': 'bank_account',
            'bankBik': 'bank_bik', 'bankCorrAccount': 'bank_corr_account',
            'signerName': 'signer_name', 'signerPosition': 'signer_position'
        }
        for key, col in requisite_fields.items():
            if key in body:
                val = str(body.get(key) or '')[:500].replace("'", "''")
                set_clauses.append(f"{col} = '{val}'" if val else f"{col} = NULL")

        deal_int_fields = {
            'totalPrice': 'total_price', 'duration': 'duration', 'days': 'days',
            'placementAmount': 'placement_amount', 'videoAmount': 'video_amount',
        }
        for key, col in deal_int_fields.items():
            if key in body:
                raw = body.get(key)
                if raw is None or raw == '':
                    set_clauses.append(f"{col} = NULL")
                    continue
                try:
                    val = max(int(raw), 0)
                except (TypeError, ValueError):
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': f'Некорректное числовое значение: {key}'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                set_clauses.append(f"{col} = {val}")

        for key, col in {'startDate': 'start_date', 'endDate': 'end_date'}.items():
            if key in body:
                raw = body.get(key)
                if not raw:
                    set_clauses.append(f"{col} = NULL")
                    continue
                val = str(raw)[:10]
                try:
                    datetime.strptime(val, '%Y-%m-%d')
                except ValueError:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': f'Некорректная дата: {key}'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                set_clauses.append(f"{col} = '{val}'")

        start_in = str(body.get('startDate') or '')[:10] if body.get('startDate') else ''
        end_in = str(body.get('endDate') or '')[:10] if body.get('endDate') else ''
        if start_in and end_in:
            try:
                d1 = datetime.strptime(start_in, '%Y-%m-%d')
                d2 = datetime.strptime(end_in, '%Y-%m-%d')
            except ValueError:
                d1 = d2 = None
            if d1 and d2:
                if d2 < d1:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Дата окончания раньше даты начала'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                real_days = (d2 - d1).days + 1
                set_clauses = [c for c in set_clauses if not c.startswith('days =')]
                set_clauses.append(f"days = {real_days}")

        if 'needVideo' in body:
            set_clauses.append(f"need_video = {'TRUE' if body.get('needVideo') else 'FALSE'}")

        if 'paidAmount' in body:
            paid_raw = body.get('paidAmount')
            try:
                paid_val = max(int(paid_raw), 0) if paid_raw is not None else 0
            except (TypeError, ValueError):
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Некорректная сумма оплаты'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            set_clauses.append(f"paid_amount = {paid_val}")

            if 'status' not in body:
                cur.execute(f"SELECT total_price, status FROM leads WHERE id = {int(lead_id)}")
                cur_row = cur.fetchone()
                if cur_row:
                    total_price, current_status = cur_row[0], cur_row[1]
                    if total_price and paid_val >= total_price and current_status not in ('live', 'completed', 'lost', 'payment'):
                        set_clauses.append("status = 'payment'")

        payments_in = body.get('payments')
        payments_changed = False
        if isinstance(payments_in, list):
            rows_to_save = []
            for idx, item in enumerate(payments_in[:24]):
                raw_date = str((item or {}).get('dueDate') or '')[:10]
                try:
                    datetime.strptime(raw_date, '%Y-%m-%d')
                except ValueError:
                    continue
                try:
                    amount = max(int((item or {}).get('amount') or 0), 0)
                except (TypeError, ValueError):
                    amount = 0
                if amount <= 0:
                    continue
                note = str((item or {}).get('comment') or '')[:255].replace("'", "''")
                is_paid = bool((item or {}).get('isPaid'))
                rows_to_save.append((raw_date, amount, note, is_paid, idx))

            cur.execute(f"DELETE FROM lead_payments WHERE lead_id = {int(lead_id)}")
            for raw_date, amount, note, is_paid, idx in rows_to_save:
                note_val = f"'{note}'" if note else 'NULL'
                paid_at_val = 'CURRENT_TIMESTAMP' if is_paid else 'NULL'
                cur.execute(
                    f"INSERT INTO lead_payments (lead_id, due_date, amount, comment, is_paid, paid_at, sort_order) "
                    f"VALUES ({int(lead_id)}, '{raw_date}', {amount}, {note_val}, "
                    f"{'TRUE' if is_paid else 'FALSE'}, {paid_at_val}, {idx})"
                )

            payments_changed = True
            paid_total = sum(r[1] for r in rows_to_save if r[3])
            set_clauses = [c for c in set_clauses if not c.startswith('paid_amount =')]
            set_clauses.append(f"paid_amount = {paid_total}")

        if not set_clauses:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Нечего обновлять'}, ensure_ascii=False),
                'isBase64Encoded': False
            }

        query = f"UPDATE leads SET {', '.join(set_clauses)} WHERE id = {int(lead_id)} RETURNING status, paid_amount"
        cur.execute(query)
        updated = cur.fetchone()
        new_status, new_paid = updated[0], updated[1] or 0

        if new_status != prev_status:
            log_event(cur, lead_id, 'status',
                      f"{STATUS_LABELS.get(prev_status, prev_status)} → {STATUS_LABELS.get(new_status, new_status)}")

        if new_paid != prev_paid:
            diff = new_paid - prev_paid
            sign = '+' if diff > 0 else '−'
            log_event(cur, lead_id, 'payment',
                      f"{sign}{abs(diff):,}".replace(',', ' ') + f" ₽ · всего {new_paid:,}".replace(',', ' ') + " ₽")

        if any(c.startswith(('company', 'inn', 'bank_', 'signer_', 'email', 'legal_', 'kpp', 'ogrn')) for c in set_clauses):
            log_event(cur, lead_id, 'requisites', 'Реквизиты обновлены')

        if any(c.startswith(('total_price', 'start_date', 'end_date', 'duration', 'days', 'placement_amount', 'video_amount')) for c in set_clauses):
            log_event(cur, lead_id, 'terms', 'Условия размещения обновлены')

        if payments_changed:
            plan_total = sum(r[1] for r in rows_to_save)
            log_event(cur, lead_id, 'schedule',
                      f"График платежей: {len(rows_to_save)} платеж(ей) на " +
                      f"{plan_total:,}".replace(',', ' ') + " ₽")

        staff = actor(event, cur)
        if new_status != prev_status:
            audit(cur, staff, event, 'status_changed', 'lead', lead_id,
                  f"Статус: {STATUS_LABELS.get(prev_status, prev_status)} → "
                  f"{STATUS_LABELS.get(new_status, new_status)}")
        if new_paid != prev_paid:
            audit(cur, staff, event, 'payment_changed', 'lead', lead_id,
                  f"Оплата: {prev_paid} → {new_paid} ₽", 'warning')
        if any(c.startswith(('total_price', 'placement_amount')) for c in set_clauses):
            audit(cur, staff, event, 'terms_changed', 'lead', lead_id,
                  'Изменены условия сделки', 'warning')

        plan_touched = any(
            c.startswith(('start_date', 'end_date', 'duration', 'status', 'placement_amount',
                          'total_price', 'paid_amount', 'company'))
            for c in set_clauses
        )
        if plan_touched:
            months = sync_placements(cur, lead_id)
            if months > 0:
                log_event(cur, lead_id, 'mediaplan',
                          f"Ролик в медиаплане: {months} мес.")

        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'status': new_status}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    if method == 'DELETE':
        admin_key = os.environ.get('ADMIN_KEY', '')
        headers = event.get('headers', {})
        provided = headers.get('X-Admin-Key') or headers.get('x-admin-key', '')

        if not allowed(event, cur):
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Доступ запрещён'}, ensure_ascii=False),
                'isBase64Encoded': False
            }

        params = event.get('queryStringParameters') or {}
        doc_id = params.get('docId')
        lead_id = params.get('leadId')
        lead_ids = params.get('leadIds')

        if lead_ids:
            try:
                ids = [int(x) for x in str(lead_ids).split(',') if str(x).strip()]
            except ValueError:
                ids = []
            if ids:
                id_list = ','.join(str(i) for i in ids)
                cur.execute(f"DELETE FROM lead_events WHERE lead_id IN ({id_list})")
                cur.execute(f"DELETE FROM lead_documents WHERE lead_id IN ({id_list})")
                cur.execute(f"DELETE FROM lead_payments WHERE lead_id IN ({id_list})")
                cur.execute(f"DELETE FROM placements WHERE lead_id IN ({id_list})")
                cur.execute(f"DELETE FROM leads WHERE id IN ({id_list})")
                audit(cur, actor(event, cur), event, 'leads_cleaned', 'lead', None,
                      f"Удалено тестовых заявок: {len(ids)}", 'warning')
                conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'success': True, 'deleted': len(ids)}, ensure_ascii=False),
                'isBase64Encoded': False
            }

        if lead_id:
            staff = actor(event, cur)
            lid = int(lead_id)

            cur.execute(
                "SELECT id, name, company, phone, email, status, total_price, paid_amount, "
                "start_date, end_date, duration, days, comment, inn, legal_address "
                f"FROM leads WHERE id = {lid}"
            )
            snap = cur.fetchone()
            if snap:
                cols = ['id', 'name', 'company', 'phone', 'email', 'status', 'total_price',
                        'paid_amount', 'start_date', 'end_date', 'duration', 'days',
                        'comment', 'inn', 'legal_address']
                payload = dict(zip(cols, snap))
                cur.execute(
                    "SELECT due_date, amount, comment, is_paid FROM lead_payments "
                    f"WHERE lead_id = {lid}")
                payload['payments'] = [
                    {'dueDate': str(r[0]), 'amount': r[1], 'comment': r[2], 'isPaid': r[3]}
                    for r in cur.fetchall()]
                title = payload.get('company') or payload.get('name') or f"Заявка №{lid}"
                to_trash(cur, staff, 'lead', lid, title, payload)
                audit(cur, staff, event, 'lead_deleted', 'lead', lid,
                      f"Удалена заявка «{title}», восстановить можно 30 дней", 'warning')

            cur.execute(f"DELETE FROM lead_events WHERE lead_id = {lid}")
            cur.execute(f"DELETE FROM lead_documents WHERE lead_id = {lid}")
            cur.execute(f"DELETE FROM lead_payments WHERE lead_id = {lid}")
            cur.execute(f"DELETE FROM placements WHERE lead_id = {lid}")
            cur.execute(f"DELETE FROM leads WHERE id = {lid}")
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'success': True}, ensure_ascii=False),
                'isBase64Encoded': False
            }

        if not doc_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Нужен docId, leadId или leadIds'}, ensure_ascii=False),
                'isBase64Encoded': False
            }

        cur.execute(f"DELETE FROM lead_documents WHERE id = {int(doc_id)}")
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    cur.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {**cors_headers, 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False),
        'isBase64Encoded': False
    }