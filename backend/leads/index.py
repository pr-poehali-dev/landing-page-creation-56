import json
import os
from datetime import datetime
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

        start_raw = str(body.get('startDate') or '')[:10]
        start_val = 'NULL'
        if start_raw:
            try:
                datetime.strptime(start_raw, '%Y-%m-%d')
                start_val = f"'{start_raw}'"
            except ValueError:
                start_val = 'NULL'

        query = (
            f"INSERT INTO leads (name, phone, comment, duration, days, need_video, total_price, source, company, email, start_date) "
            f"VALUES ('{name_esc}', '{phone_esc}', '{comment_esc}', {dur_val}, {days_val}, "
            f"{'TRUE' if need_video else 'FALSE'}, {price_val}, '{source_esc}', {company_val}, {email_val}, {start_val}) RETURNING id"
        )
        cur.execute(query)
        lead_id = cur.fetchone()[0]
        log_event(cur, lead_id, 'created',
                  'Добавлена вручную' if source == 'manual' else 'Заявка с сайта')
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

        if admin_key and provided != admin_key:
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
            "signer_name, signer_position, paid_amount, email "
            "FROM leads ORDER BY created_at DESC LIMIT 200"
        )
        rows = cur.fetchall()
        leads = [{
            'id': r[0], 'name': r[1], 'phone': r[2], 'comment': r[3],
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
            'documents': [], 'events': []
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

        if admin_key and provided != admin_key:
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

        if admin_key and provided != admin_key:
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

        if lead_id:
            cur.execute(f"DELETE FROM lead_events WHERE lead_id = {int(lead_id)}")
            cur.execute(f"DELETE FROM lead_documents WHERE lead_id = {int(lead_id)}")
            cur.execute(f"DELETE FROM leads WHERE id = {int(lead_id)}")
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
                'body': json.dumps({'error': 'Нужен docId или leadId'}, ensure_ascii=False),
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