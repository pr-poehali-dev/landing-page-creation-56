import json
import os
import io
import time
from datetime import datetime, date
import psycopg2
import boto3

BACKUP_TABLES = [
    'leads', 'lead_payments', 'lead_documents', 'lead_events',
    'placements', 'contacts', 'contact_touches', 'city_ads',
    'screen_points', 'watch_sources', 'watch_signals', 'revenue_facts',
]


def esc(v):
    if v is None or v == '':
        return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"


def who_ip(event):
    req = event.get('requestContext') or {}
    ident = req.get('identity') or {}
    raw = event.get('headers') or {}
    fwd = raw.get('X-Forwarded-For') or raw.get('x-forwarded-for') or ''
    return ((fwd.split(',')[0].strip() if fwd else '') or ident.get('sourceIp') or '')[:45]


def actor(event, cur):
    headers = event.get('headers') or {}
    token = headers.get('X-Session-Token') or headers.get('x-session-token')
    if not token:
        return None
    cur.execute(
        "SELECT s.staff_id, st.name, st.role FROM staff_sessions s "
        "JOIN staff st ON st.id = s.staff_id "
        f"WHERE s.token = {esc(token)} AND s.revoked = FALSE "
        "AND s.expires_at > CURRENT_TIMESTAMP AND st.active = TRUE"
    )
    r = cur.fetchone()
    return {'id': r[0], 'name': r[1], 'role': r[2]} if r else None


def audit(cur, staff, event, action, entity=None, entity_id=None,
          details=None, severity='info'):
    cur.execute(
        "INSERT INTO audit_log (staff_id, staff_name, action, entity, entity_id, "
        "details, ip, severity) VALUES ("
        f"{staff['id'] if staff else 'NULL'}, {esc(staff['name'] if staff else None)}, "
        f"{esc(action)}, {esc(entity)}, {int(entity_id) if entity_id else 'NULL'}, "
        f"{esc(str(details)[:580] if details else None)}, {esc(who_ip(event))}, {esc(severity)})"
    )


def make_backup(cur, kind='auto'):
    dump = {'createdAt': datetime.utcnow().isoformat(), 'kind': kind, 'tables': {}}
    for table in BACKUP_TABLES:
        try:
            cur.execute(f"SELECT * FROM {table}")
            cols = [d[0] for d in cur.description]
            rows = []
            for r in cur.fetchall():
                rows.append({c: (v.isoformat() if isinstance(v, (datetime, date)) else v)
                             for c, v in zip(cols, r)})
            dump['tables'][table] = rows
        except Exception as e:
            dump['tables'][table] = {'error': str(e)[:120]}

    body = json.dumps(dump, ensure_ascii=False, default=str).encode('utf-8')
    s3 = boto3.client('s3', endpoint_url='https://bucket.poehali.dev',
                      aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                      aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])
    key = f"backups/crm_{datetime.utcnow().strftime('%Y%m')}_{int(time.time())}.json"
    s3.put_object(Bucket='files', Key=key, Body=body, ContentType='application/json')
    url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    total = sum(len(v) for v in dump['tables'].values() if isinstance(v, list))
    cur.execute(
        "INSERT INTO backup_runs (file_url, kind, status, note) VALUES ("
        f"{esc(url)}, {esc(kind)}, 'ok', {esc(f'Записей: {total}')})"
    )
    return {'url': url, 'records': total}


def restore_lead(cur, payload):
    def q(v):
        return esc(v) if v is not None else 'NULL'

    cur.execute(
        "INSERT INTO leads (name, company, phone, email, status, total_price, paid_amount, "
        "start_date, end_date, duration, days, comment, inn, legal_address, source) VALUES ("
        f"{q(payload.get('name'))}, {q(payload.get('company'))}, {q(payload.get('phone'))}, "
        f"{q(payload.get('email'))}, {q(payload.get('status') or 'new')}, "
        f"{payload.get('total_price') or 'NULL'}, {payload.get('paid_amount') or 0}, "
        f"{q(payload.get('start_date'))}, {q(payload.get('end_date'))}, "
        f"{payload.get('duration') or 'NULL'}, {payload.get('days') or 'NULL'}, "
        f"{q(payload.get('comment'))}, {q(payload.get('inn'))}, "
        f"{q(payload.get('legal_address'))}, 'manual') RETURNING id"
    )
    new_id = cur.fetchone()[0]

    for p in payload.get('payments') or []:
        cur.execute(
            "INSERT INTO lead_payments (lead_id, due_date, amount, comment, is_paid) VALUES ("
            f"{new_id}, {q(p.get('dueDate'))}, {int(p.get('amount') or 0)}, "
            f"{q(p.get('comment'))}, {'TRUE' if p.get('isPaid') else 'FALSE'})"
        )
    return new_id


def handler(event: dict, context) -> dict:
    """Корзина удалённых записей с восстановлением и резервные копии базы CRM"""
    method = event.get('httpMethod', 'GET')
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key, X-Session-Token',
        'Access-Control-Max-Age': '86400',
    }
    out = {**cors, 'Content-Type': 'application/json'}

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    body = json.loads(event.get('body') or '{}')
    action = body.get('action')

    if method == 'POST' and action == 'autoBackup':
        master = os.environ.get('ADMIN_KEY', '')
        headers = event.get('headers') or {}
        provided = headers.get('X-Admin-Key') or headers.get('x-admin-key', '')
        by_session = actor(event, cur) is not None
        if master and provided != master and not by_session:
            cur.close(); conn.close()
            return {'statusCode': 403, 'headers': out,
                    'body': json.dumps({'error': 'Доступ запрещён'}, ensure_ascii=False)}

        cur.execute(
            "SELECT COUNT(*) FROM backup_runs WHERE kind = 'auto' "
            "AND created_at > CURRENT_TIMESTAMP - INTERVAL '25 days'")
        if cur.fetchone()[0] > 0:
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': out,
                    'body': json.dumps({'skipped': True}, ensure_ascii=False)}

        res = make_backup(cur, 'auto')
        audit(cur, None, event, 'backup_auto', 'system', None,
              f"Автоматическая копия, записей: {res['records']}")
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps(res, ensure_ascii=False)}

    staff = actor(event, cur)
    if not staff:
        cur.close(); conn.close()
        return {'statusCode': 401, 'headers': out,
                'body': json.dumps({'error': 'Сессия истекла, войдите снова'}, ensure_ascii=False)}

    if method == 'GET':
        cur.execute(
            "SELECT id, entity, entity_id, title, removed_by, restore_until, created_at "
            "FROM trash_bin WHERE restored = FALSE AND restore_until >= CURRENT_DATE "
            "ORDER BY created_at DESC LIMIT 100"
        )
        items = [{
            'id': r[0], 'entity': r[1], 'entityId': r[2], 'title': r[3],
            'removedBy': r[4], 'restoreUntil': r[5].isoformat() if r[5] else None,
            'createdAt': r[6].isoformat() if r[6] else None,
            'daysLeft': (r[5] - date.today()).days if r[5] else 0,
        } for r in cur.fetchall()]

        cur.execute(
            "SELECT id, file_url, kind, status, note, created_at FROM backup_runs "
            "ORDER BY created_at DESC LIMIT 12")
        backups = [{
            'id': r[0], 'url': r[1], 'kind': r[2], 'status': r[3], 'note': r[4],
            'createdAt': r[5].isoformat() if r[5] else None,
        } for r in cur.fetchall()]

        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out, 'body': json.dumps({
            'items': items, 'backups': backups, 'role': staff['role'],
        }, ensure_ascii=False), 'isBase64Encoded': False}

    if method == 'POST' and action == 'restore':
        tid = int(body.get('trashId'))
        cur.execute(
            f"SELECT entity, title, payload FROM trash_bin WHERE id = {tid} AND restored = FALSE")
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return {'statusCode': 404, 'headers': out,
                    'body': json.dumps({'error': 'Запись не найдена'}, ensure_ascii=False)}

        payload = json.loads(row[2])
        new_id = restore_lead(cur, payload) if row[0] == 'lead' else None
        cur.execute(f"UPDATE trash_bin SET restored = TRUE WHERE id = {tid}")
        audit(cur, staff, event, 'restored', row[0], new_id,
              f"Восстановлено из корзины: {row[1]}", 'warning')
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'success': True, 'newId': new_id}, ensure_ascii=False)}

    if method == 'POST' and action == 'backup':
        if staff['role'] != 'director':
            cur.close(); conn.close()
            return {'statusCode': 403, 'headers': out,
                    'body': json.dumps({'error': 'Копии создаёт руководитель'}, ensure_ascii=False)}
        res = make_backup(cur, 'manual')
        audit(cur, staff, event, 'backup_created', 'system', None,
              f"Создана резервная копия, записей: {res['records']}", 'warning')
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps(res, ensure_ascii=False)}

    cur.close(); conn.close()
    return {'statusCode': 405, 'headers': out,
            'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False)}
