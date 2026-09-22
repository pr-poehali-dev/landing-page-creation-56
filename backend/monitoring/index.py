import json
import os
import re
import hashlib
import ssl
import urllib.request
import urllib.parse
from datetime import date, datetime, timedelta
import psycopg2

ZAKUPKI_API = "https://zakupki.gov.ru/epz/order/extendedsearch/results.html"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE


def esc(v):
    if v is None or v == '':
        return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"


def session_ok(event, cur):
    """Доступ по мастер-паролю или активной сессии сотрудника"""
    master = os.environ.get('ADMIN_KEY', '')
    headers = event.get('headers') or {}
    provided = headers.get('X-Admin-Key') or headers.get('x-admin-key', '')
    if master and provided == master:
        return True
    token = headers.get('X-Session-Token') or headers.get('x-session-token')
    if not token:
        return False
    safe = str(token).replace("'", "''")
    cur.execute(
        "SELECT 1 FROM staff_sessions s JOIN staff st ON st.id = s.staff_id "
        f"WHERE s.token = '{safe}' AND s.revoked = FALSE "
        "AND s.expires_at > CURRENT_TIMESTAMP AND st.active = TRUE"
    )
    return cur.fetchone() is not None


def fetch(url, timeout=6):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'ru'})
    with urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX) as resp:
        raw = resp.read(500000)
    try:
        return raw.decode('utf-8', errors='ignore')
    except Exception:
        return ''


def text_only(html):
    html = re.sub(r'<script[\s\S]*?</script>', ' ', html, flags=re.I)
    html = re.sub(r'<style[\s\S]*?</style>', ' ', html, flags=re.I)
    html = re.sub(r'<[^>]+>', ' ', html)
    html = re.sub(r'&[a-z]+;', ' ', html)
    return re.sub(r'\s+', ' ', html).strip()


def check_site(cur, row):
    src_id, title, url, keywords, last_hash = row
    try:
        html = fetch(url)
    except Exception as e:
        cur.execute(
            f"UPDATE watch_sources SET last_checked_at = CURRENT_TIMESTAMP, "
            f"last_status = 'error' WHERE id = {src_id}")
        return {'title': title, 'status': 'error', 'message': str(e)[:120]}

    body = text_only(html)
    digest = hashlib.sha256(body.encode('utf-8')).hexdigest()

    found = []
    if keywords:
        low = body.lower()
        for kw in str(keywords).split(','):
            k = kw.strip().lower()
            if k and k in low:
                found.append(kw.strip())

    changed = bool(last_hash) and last_hash != digest
    status = 'changed' if changed else 'same'

    sets = [f"last_hash = '{digest}'", "last_checked_at = CURRENT_TIMESTAMP",
            f"last_status = '{status}'"]
    if changed:
        sets.append("changed_at = CURRENT_TIMESTAMP")
    cur.execute(f"UPDATE watch_sources SET {', '.join(sets)} WHERE id = {src_id}")

    if changed:
        detail = f"Обновился сайт. Найдено по ключевым словам: {', '.join(found)}" if found \
            else "Изменилось содержимое страницы — проверьте, не запускают ли рекламу"
        cur.execute(
            "INSERT INTO watch_signals (source_id, signal_type, title, details, url) VALUES ("
            f"{src_id}, 'site_change', {esc(f'Изменения на сайте: {title}')}, "
            f"{esc(detail[:580])}, {esc(url)})"
        )

    return {'title': title, 'status': status, 'keywords': found}


def search_tenders(cur, query, region_code='25'):
    params = {
        'searchString': query,
        'morphology': 'on',
        'search-filter': 'Дате размещения',
        'pageNumber': '1',
        'sortDirection': 'false',
        'recordsPerPage': '_10',
        'fz44': 'on', 'fz223': 'on',
        'af': 'on',
        'currencyIdGeneral': '-1',
        'regionDeleted': 'false',
        'OrderPlacementSmallBusinessSubject': 'on',
    }
    url = ZAKUPKI_API + '?' + urllib.parse.urlencode(params)
    try:
        html = fetch(url, timeout=12)
    except Exception as e:
        return {'error': str(e)[:150], 'found': 0}

    cards = re.findall(
        r'registry-entry__header-mid__number[\s\S]{0,200}?href="([^"]+)"[\s\S]{0,120}?>\s*([^<]{6,80})',
        html)
    names = re.findall(r'registry-entry__body-value">\s*([^<]{10,260})', html)
    prices = re.findall(r'price-block__value"[^>]*>\s*([0-9\u00a0\s,\.]+)', html)

    found = 0
    for i, (href, num) in enumerate(cards[:10]):
        link = href if href.startswith('http') else 'https://zakupki.gov.ru' + href
        name = names[i].strip() if i < len(names) else query
        amount = None
        if i < len(prices):
            digits = re.sub(r'[^\d,]', '', prices[i]).replace(',', '.')
            try:
                amount = float(digits)
            except ValueError:
                amount = None

        cur.execute(
            f"SELECT COUNT(*) FROM watch_signals WHERE url = {esc(link)}")
        if cur.fetchone()[0] > 0:
            continue

        cur.execute(
            "INSERT INTO watch_signals (signal_type, title, details, url, amount) VALUES ("
            f"'tender', {esc(name[:290])}, {esc(('Закупка № ' + num.strip())[:580])}, "
            f"{esc(link)}, {amount if amount is not None else 'NULL'})"
        )
        found += 1

    return {'found': found, 'query': query}


def handler(event: dict, context) -> dict:
    """Мониторинг конкурентов: маршрут объезда экранов, слежение за сайтами клиентов и поиск тендеров на наружную рекламу"""
    method = event.get('httpMethod', 'GET')
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if not session_ok(event, cur):
        cur.close(); conn.close()
        return {'statusCode': 403, 'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Доступ запрещён'}, ensure_ascii=False)}
    out = {**cors, 'Content-Type': 'application/json'}

    if method == 'GET':
        cur.execute(
            "SELECT id, screen_type, address, operator, note, check_days, last_checked_at, active "
            "FROM screen_points WHERE active = TRUE ORDER BY sort_order, id"
        )
        today = date.today()
        points = []
        for r in cur.fetchall():
            last = r[6]
            days_ago = (today - last.date()).days if last else None
            overdue = days_ago is None or days_ago >= (r[5] or 7)
            points.append({
                'id': r[0], 'screenType': r[1], 'address': r[2], 'operator': r[3],
                'note': r[4], 'checkDays': r[5],
                'lastCheckedAt': last.isoformat() if last else None,
                'daysAgo': days_ago, 'overdue': overdue,
            })

        cur.execute(
            "SELECT id, title, url, kind, keywords, last_checked_at, last_status, changed_at "
            "FROM watch_sources WHERE active = TRUE ORDER BY id DESC"
        )
        sources = [{
            'id': r[0], 'title': r[1], 'url': r[2], 'kind': r[3], 'keywords': r[4],
            'lastCheckedAt': r[5].isoformat() if r[5] else None,
            'lastStatus': r[6],
            'changedAt': r[7].isoformat() if r[7] else None,
        } for r in cur.fetchall()]

        cur.execute(
            "SELECT id, signal_type, title, details, url, amount, is_read, created_at "
            "FROM watch_signals ORDER BY is_read, created_at DESC LIMIT 60"
        )
        signals = [{
            'id': r[0], 'type': r[1], 'title': r[2], 'details': r[3], 'url': r[4],
            'amount': float(r[5]) if r[5] is not None else None,
            'isRead': r[6], 'createdAt': r[7].isoformat() if r[7] else None,
        } for r in cur.fetchall()]

        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': out, 'body': json.dumps({
            'points': points, 'sources': sources, 'signals': signals,
            'overdueCount': sum(1 for p in points if p['overdue']),
            'unreadCount': sum(1 for s in signals if not s['isRead']),
        }, ensure_ascii=False), 'isBase64Encoded': False}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')

    if action == 'checkPoint':
        pid = int(body.get('pointId'))
        cur.execute(
            f"UPDATE screen_points SET last_checked_at = CURRENT_TIMESTAMP WHERE id = {pid}")
        brand = str(body.get('brand') or '').strip()[:250]
        if brand:
            cur.execute("SELECT screen_type, address FROM screen_points WHERE id = %s" % pid)
            p = cur.fetchone()
            cur.execute(
                "INSERT INTO city_ads (seen_date, screen_type, screen_address, brand, ad_source) "
                f"VALUES (CURRENT_DATE, {esc(p[0] if p else None)}, {esc(p[1] if p else None)}, "
                f"{esc(brand)}, 'Объезд')"
            )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'success': True}, ensure_ascii=False)}

    if action == 'addPoint':
        addr = str(body.get('address') or '').strip()[:250]
        stype = str(body.get('screenType') or '').strip()[:120]
        if not addr or not stype:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': out,
                    'body': json.dumps({'error': 'Укажите тип экрана и адрес'}, ensure_ascii=False)}
        cur.execute(
            "INSERT INTO screen_points (screen_type, address, operator, check_days) VALUES ("
            f"{esc(stype)}, {esc(addr)}, {esc(str(body.get('operator') or '')[:120] or None)}, "
            f"{int(body.get('checkDays') or 7)}) RETURNING id"
        )
        nid = cur.fetchone()[0]
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'id': nid}, ensure_ascii=False)}

    if action == 'deletePoint':
        cur.execute(f"UPDATE screen_points SET active = FALSE WHERE id = {int(body.get('pointId'))}")
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'success': True}, ensure_ascii=False)}

    if action == 'addSource':
        url = str(body.get('url') or '').strip()[:400]
        title = str(body.get('title') or '').strip()[:200]
        if not url or not title:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': out,
                    'body': json.dumps({'error': 'Укажите название и ссылку'}, ensure_ascii=False)}
        if not url.startswith('http'):
            url = 'https://' + url
        cur.execute(
            "INSERT INTO watch_sources (title, url, kind, keywords) VALUES ("
            f"{esc(title)}, {esc(url)}, {esc(body.get('kind') or 'site')}, "
            f"{esc(str(body.get('keywords') or '')[:290] or None)}) RETURNING id"
        )
        nid = cur.fetchone()[0]
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'id': nid}, ensure_ascii=False)}

    if action == 'deleteSource':
        sid = int(body.get('sourceId'))
        cur.execute(f"UPDATE watch_sources SET active = FALSE WHERE id = {sid}")
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'success': True}, ensure_ascii=False)}

    if action == 'checkSources':
        limit = int(body.get('limit') or 4)
        cur.execute(
            "SELECT id, title, url, keywords, last_hash FROM watch_sources "
            "WHERE active = TRUE ORDER BY last_checked_at NULLS FIRST LIMIT %d" % limit)
        rows = cur.fetchall()
        results = [check_site(cur, r) for r in rows]
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'checked': results}, ensure_ascii=False)}

    if action == 'searchTenders':
        query = str(body.get('query') or 'наружная реклама светодиодный экран')[:150]
        res = search_tenders(cur, query)
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps(res, ensure_ascii=False)}

    if action == 'readSignal':
        cur.execute(
            f"UPDATE watch_signals SET is_read = TRUE WHERE id = {int(body.get('signalId'))}")
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'success': True}, ensure_ascii=False)}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': out,
            'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False)}
