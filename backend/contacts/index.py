import json
import os
import base64
import zlib
import calendar
from datetime import date, datetime, timedelta
import psycopg2
from base_data import PACKED

FUNNEL = ('new', 'contacted', 'price_sent', 'negotiation', 'won', 'refused', 'sleeping')


def esc(v):
    if v is None or v == '':
        return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"


def norm(s):
    return ''.join(ch for ch in str(s or '').lower() if ch.isalnum())[:18]


def contact_row(r):
    return {
        'id': r[0], 'company': r[1], 'industry': r[2], 'category': r[3],
        'profile': r[4], 'city': r[5], 'address': r[6], 'phone': r[7],
        'email': r[8], 'site': r[9], 'note': r[10], 'source': r[11],
        'channel': r[12], 'funnelStatus': r[13], 'priceSent': r[14],
        'wasClient': r[15], 'leadId': r[16],
        'lastTouchAt': r[17].isoformat() if r[17] else None,
        'nextTouchAt': r[18].isoformat() if r[18] else None,
        'touchCount': r[19] or 0,
        'lastResult': r[20],
    }


SELECT_SQL = (
    "SELECT c.id, c.company, c.industry, c.category, c.profile, c.city, c.address, "
    "c.phone, c.email, c.site, c.note, c.source, c.channel, c.funnel_status, "
    "c.price_sent, c.was_client, c.lead_id, c.last_touch_at, c.next_touch_at, "
    "(SELECT COUNT(*) FROM contact_touches t WHERE t.contact_id = c.id), "
    "(SELECT t.result FROM contact_touches t WHERE t.contact_id = c.id "
    " ORDER BY t.created_at DESC LIMIT 1) "
    "FROM contacts c"
)


def do_import(cur):
    cur.execute("SELECT COUNT(*) FROM contacts")
    if cur.fetchone()[0] > 0:
        cur.execute("SELECT COUNT(*) FROM contacts")
        return {'skipped': True, 'existing': cur.fetchone()[0]}

    blob = json.loads(zlib.decompress(base64.b64decode(PACKED)).decode('utf-8'))

    cur.execute("SELECT LOWER(brand) FROM placements")
    known = set(norm(r[0]) for r in cur.fetchall() if r[0])

    chunk = []
    total = 0
    for c in blob['contacts']:
        was_client = norm(c.get('company')) in known
        chunk.append(
            f"({esc(c.get('company'))},{esc(c.get('industry'))},{esc(c.get('category'))},"
            f"{esc(c.get('profile'))},{esc(c.get('city'))},{esc(c.get('address'))},"
            f"{esc(c.get('phone'))},{esc(c.get('email'))},{esc(c.get('site'))},"
            f"{esc((c.get('note') or '')[:480] or None)},{esc(c.get('source'))},"
            f"{esc(c.get('channel'))},{'TRUE' if c.get('price_sent') else 'FALSE'},"
            f"{'TRUE' if was_client else 'FALSE'})"
        )
        if len(chunk) >= 60:
            cur.execute(
                "INSERT INTO contacts (company,industry,category,profile,city,address,"
                "phone,email,site,note,source,channel,price_sent,was_client) VALUES "
                + ','.join(chunk))
            total += len(chunk)
            chunk = []
    if chunk:
        cur.execute(
            "INSERT INTO contacts (company,industry,category,profile,city,address,"
            "phone,email,site,note,source,channel,price_sent,was_client) VALUES "
            + ','.join(chunk))
        total += len(chunk)

    ads = []
    for a in blob['ads']:
        ads.append(
            f"({esc(a.get('seen'))},{esc(a.get('screen'))},{esc(a.get('address'))},"
            f"{esc(a.get('brand'))},{esc(a.get('company'))},{esc(a.get('source'))})"
        )
    if ads:
        cur.execute(
            "INSERT INTO city_ads (seen_date,screen_type,screen_address,brand,company,ad_source) "
            "VALUES " + ','.join(ads))

    return {'contacts': total, 'ads': len(ads)}


def free_days(cur, months_ahead=3):
    """Ищет месяцы с низкой загрузкой экрана"""
    cur.execute("SELECT daily_capacity_sec FROM screen_settings WHERE id = 1")
    st = cur.fetchone()
    capacity = st[0] if st else 300

    today = date.today()
    result = []
    for i in range(months_ahead):
        m = today.month + i
        y = today.year + (m - 1) // 12
        m = (m - 1) % 12 + 1
        days = calendar.monthrange(y, m)[1]
        cur.execute(
            f"SELECT day_seconds FROM placements WHERE plan_year = {y} AND plan_month = {m}")
        load = [0] * days
        for (sec_str,) in cur.fetchall():
            if not sec_str:
                continue
            for idx, part in enumerate(str(sec_str).split(',')[:days]):
                try:
                    load[idx] += int(part)
                except ValueError:
                    pass
        used = sum(load)
        total = capacity * days
        result.append({
            'year': y, 'month': m,
            'freeSec': max(total - used, 0),
            'fillPct': round(used / total * 100) if total else 0,
        })
    return result


def handler(event: dict, context) -> dict:
    """Клиентская база: контакты потенциальных клиентов, воронка обзвона, касания и мониторинг рекламы в городе"""
    method = event.get('httpMethod', 'GET')
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    admin_key = os.environ.get('ADMIN_KEY', '')
    headers = event.get('headers', {})
    provided = headers.get('X-Admin-Key') or headers.get('x-admin-key', '')
    if admin_key and provided != admin_key:
        return {'statusCode': 403, 'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Доступ запрещён'}, ensure_ascii=False)}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    out_headers = {**cors, 'Content-Type': 'application/json'}

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        industry = params.get('industry')
        status = params.get('status')
        search = params.get('search')
        limit = min(int(params.get('limit') or 300), 1000)

        where = []
        if industry and industry != 'all':
            where.append(f"c.industry = {esc(industry)}")
        if status and status != 'all':
            where.append(f"c.funnel_status = {esc(status)}")
        if search:
            s = str(search).replace("'", "''").lower()
            where.append(
                f"(LOWER(c.company) LIKE '%{s}%' OR LOWER(COALESCE(c.phone,'')) LIKE '%{s}%' "
                f"OR LOWER(COALESCE(c.note,'')) LIKE '%{s}%' OR LOWER(COALESCE(c.email,'')) LIKE '%{s}%')"
            )
        sql = SELECT_SQL
        if where:
            sql += " WHERE " + " AND ".join(where)
        sql += f" ORDER BY c.was_client DESC, c.company LIMIT {limit}"
        cur.execute(sql)
        items = [contact_row(r) for r in cur.fetchall()]

        cur.execute("SELECT industry, COUNT(*) FROM contacts GROUP BY industry ORDER BY COUNT(*) DESC")
        industries = [{'name': r[0] or 'Без отрасли', 'count': r[1]} for r in cur.fetchall()]

        cur.execute("SELECT funnel_status, COUNT(*) FROM contacts GROUP BY funnel_status")
        statuses = {r[0]: r[1] for r in cur.fetchall()}

        today = date.today().isoformat()
        cur.execute(
            SELECT_SQL + f" WHERE c.next_touch_at IS NOT NULL AND c.next_touch_at <= '{today}' "
            "AND c.funnel_status NOT IN ('won','refused') ORDER BY c.next_touch_at LIMIT 40"
        )
        due = [contact_row(r) for r in cur.fetchall()]

        cur.execute(
            SELECT_SQL + " WHERE c.was_client = TRUE AND c.funnel_status = 'new' "
            "ORDER BY c.company LIMIT 40"
        )
        sleeping = [contact_row(r) for r in cur.fetchall()]

        cur.execute(
            "SELECT a.brand, a.screen_type, a.screen_address, a.seen_date, a.ad_source, a.company "
            "FROM city_ads a ORDER BY a.seen_date DESC NULLS LAST LIMIT 200"
        )
        ads = [{'brand': r[0], 'screen': r[1], 'address': r[2],
                'seen': r[3].isoformat() if r[3] else None,
                'source': r[4], 'company': r[5]} for r in cur.fetchall()]

        cur.execute("SELECT DISTINCT LOWER(brand) FROM placements")
        our = set(norm(r[0]) for r in cur.fetchall() if r[0])
        for a in ads:
            a['wasOurClient'] = norm(a['brand']) in our

        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': out_headers,
                'body': json.dumps({
                    'items': items, 'industries': industries, 'statuses': statuses,
                    'due': due, 'sleeping': sleeping, 'ads': ads,
                    'total': sum(i['count'] for i in industries),
                }, ensure_ascii=False), 'isBase64Encoded': False}

    body = json.loads(event.get('body') or '{}')

    if method == 'POST' and body.get('action') == 'import':
        res = do_import(cur)
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': out_headers,
                'body': json.dumps(res, ensure_ascii=False)}

    if method == 'POST' and body.get('action') == 'freeDays':
        res = free_days(cur)
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': out_headers,
                'body': json.dumps({'months': res}, ensure_ascii=False)}

    if method == 'POST' and body.get('action') == 'touch':
        cid = int(body.get('contactId'))
        result = str(body.get('result') or 'call')[:30]
        comment = str(body.get('comment') or '')[:480]
        next_days = body.get('nextInDays')

        cur.execute(
            "INSERT INTO contact_touches (contact_id, touch_type, result, comment) VALUES "
            f"({cid}, {esc(body.get('touchType') or 'call')}, {esc(result)}, {esc(comment or None)})"
        )

        sets = ["last_touch_at = CURRENT_TIMESTAMP"]
        if body.get('funnelStatus') in FUNNEL:
            sets.append(f"funnel_status = {esc(body['funnelStatus'])}")
        if next_days:
            nd = (date.today() + timedelta(days=int(next_days))).isoformat()
            sets.append(f"next_touch_at = '{nd}'")
        elif body.get('clearNext'):
            sets.append("next_touch_at = NULL")
        if body.get('priceSent'):
            sets.append("price_sent = TRUE")

        cur.execute(f"UPDATE contacts SET {', '.join(sets)} WHERE id = {cid}")
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': out_headers,
                'body': json.dumps({'success': True}, ensure_ascii=False)}

    if method == 'PATCH':
        cid = int(body.get('id'))
        fields = {}
        for key, col in [('company', 'company'), ('phone', 'phone'), ('email', 'email'),
                         ('note', 'note'), ('industry', 'industry'), ('city', 'city'),
                         ('site', 'site'), ('manager', 'manager'), ('address', 'address')]:
            if key in body:
                fields[col] = esc(str(body[key] or '')[:480] or None)
        if body.get('funnelStatus') in FUNNEL:
            fields['funnel_status'] = esc(body['funnelStatus'])
        if 'nextTouchAt' in body:
            fields['next_touch_at'] = esc(body['nextTouchAt'] or None)
        if 'leadId' in body:
            fields['lead_id'] = int(body['leadId']) if body['leadId'] else 'NULL'

        if fields:
            sets = ', '.join(f"{k} = {v}" for k, v in fields.items())
            cur.execute(f"UPDATE contacts SET {sets} WHERE id = {cid}")
            conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': out_headers,
                'body': json.dumps({'success': True}, ensure_ascii=False)}

    if method == 'POST':
        company = str(body.get('company') or '').strip()[:250]
        if not company:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': out_headers,
                    'body': json.dumps({'error': 'Название компании обязательно'}, ensure_ascii=False)}
        cur.execute(
            "INSERT INTO contacts (company, industry, phone, email, note, city, site, source) VALUES ("
            f"{esc(company)}, {esc(body.get('industry'))}, {esc(body.get('phone'))}, "
            f"{esc(body.get('email'))}, {esc(body.get('note'))}, {esc(body.get('city'))}, "
            f"{esc(body.get('site'))}, 'Добавлен вручную') RETURNING id"
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': out_headers,
                'body': json.dumps({'id': new_id}, ensure_ascii=False)}

    if method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        cid = params.get('id')
        if cid:
            cur.execute(f"DELETE FROM contact_touches WHERE contact_id = {int(cid)}")
            cur.execute(f"DELETE FROM contacts WHERE id = {int(cid)}")
            conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': out_headers,
                'body': json.dumps({'success': True}, ensure_ascii=False)}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': out_headers,
            'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False)}
