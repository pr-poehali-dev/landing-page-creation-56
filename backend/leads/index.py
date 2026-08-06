import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Приём заявок с сайта Флэшборд и получение списка заявок для админки"""
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
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

        query = (
            f"INSERT INTO leads (name, phone, comment, duration, days, need_video, total_price, source, company) "
            f"VALUES ('{name_esc}', '{phone_esc}', '{comment_esc}', {dur_val}, {days_val}, "
            f"{'TRUE' if need_video else 'FALSE'}, {price_val}, '{source_esc}', {company_val}) RETURNING id"
        )
        cur.execute(query)
        lead_id = cur.fetchone()[0]
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
            "source, status, created_at, company, start_date, end_date, placement_amount, video_amount "
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
            'placementAmount': r[14], 'videoAmount': r[15]
        } for r in rows]

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
        status = body.get('status')

        if not lead_id or not status:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'id и status обязательны'}, ensure_ascii=False),
                'isBase64Encoded': False
            }

        if status not in valid_statuses:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Недопустимый статус'}, ensure_ascii=False),
                'isBase64Encoded': False
            }

        status_esc = status.replace("'", "''")
        cur.execute(f"UPDATE leads SET status = '{status_esc}' WHERE id = {int(lead_id)}")
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