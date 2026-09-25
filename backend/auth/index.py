import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2

SESSION_HOURS = 12

STAFF_SEED = [
    ('Екатерина', 'ekaterina', 'director'),
    ('Елена', 'elena', 'manager'),
    ('Максим', 'maksim', 'manager'),
]

ROLE_LABELS = {'director': 'Руководитель', 'manager': 'Менеджер'}


def esc(v):
    if v is None or v == '':
        return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"


def hash_pass(password, salt):
    return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'),
                               salt.encode('utf-8'), 120000).hex()


def client_ip(event):
    req = event.get('requestContext') or {}
    ident = req.get('identity') or {}
    raw = event.get('headers') or {}
    fwd = raw.get('X-Forwarded-For') or raw.get('x-forwarded-for') or ''
    ip = (fwd.split(',')[0].strip() if fwd else '') or ident.get('sourceIp') or ''
    return ip[:45]


def log(cur, staff, action, entity=None, entity_id=None, details=None,
        ip=None, severity='info'):
    cur.execute(
        "INSERT INTO audit_log (staff_id, staff_name, action, entity, entity_id, "
        "details, ip, severity) VALUES ("
        f"{staff['id'] if staff else 'NULL'}, {esc(staff['name'] if staff else None)}, "
        f"{esc(action)}, {esc(entity)}, {entity_id if entity_id else 'NULL'}, "
        f"{esc(str(details)[:580] if details else None)}, {esc(ip)}, {esc(severity)})"
    )


def ensure_seed(cur):
    cur.execute("SELECT COUNT(*) FROM staff")
    if cur.fetchone()[0] > 0:
        return []
    created = []
    for name, login, role in STAFF_SEED:
        temp = secrets.token_urlsafe(6)
        salt = secrets.token_hex(8)
        cur.execute(
            "INSERT INTO staff (name, login, pass_hash, pass_salt, role, must_change) VALUES ("
            f"{esc(name)}, {esc(login)}, {esc(hash_pass(temp, salt))}, {esc(salt)}, "
            f"{esc(role)}, TRUE)"
        )
        created.append({'name': name, 'login': login, 'role': role, 'password': temp})
    return created


def session_staff(cur, token):
    if not token:
        return None
    cur.execute(
        "SELECT s.staff_id, st.name, st.role, s.expires_at, st.active "
        "FROM staff_sessions s JOIN staff st ON st.id = s.staff_id "
        f"WHERE s.token = {esc(token)} AND s.revoked = FALSE"
    )
    row = cur.fetchone()
    if not row or not row[4]:
        return None
    if row[3] < datetime.utcnow():
        return None
    return {'id': row[0], 'name': row[1], 'role': row[2]}


def handler(event: dict, context) -> dict:
    """Вход сотрудников по личным аккаунтам, сессии с автовыходом и журнал действий"""
    method = event.get('httpMethod', 'POST')
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
    headers = event.get('headers') or {}
    token = headers.get('X-Session-Token') or headers.get('x-session-token')
    ip = client_ip(event)
    body = json.loads(event.get('body') or '{}')
    action = body.get('action')

    if method == 'POST' and action == 'setup':
        master = os.environ.get('ADMIN_KEY', '')
        provided = headers.get('X-Admin-Key') or headers.get('x-admin-key', '')
        if master and provided != master:
            cur.close(); conn.close()
            return {'statusCode': 403, 'headers': out,
                    'body': json.dumps({'error': 'Нужен мастер-пароль'}, ensure_ascii=False)}
        created = ensure_seed(cur)
        if created:
            log(cur, None, 'staff_created', 'staff', None,
                f"Созданы аккаунты: {', '.join(c['name'] for c in created)}", ip, 'warning')
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'created': created}, ensure_ascii=False)}

    if method == 'POST' and action == 'login':
        login = str(body.get('login') or '').strip().lower()[:60]
        password = str(body.get('password') or '')
        cur.execute(
            "SELECT id, name, role, pass_hash, pass_salt, active, must_change "
            f"FROM staff WHERE LOWER(login) = {esc(login)}"
        )
        row = cur.fetchone()
        if not row or not row[5] or hash_pass(password, row[4]) != row[3]:
            log(cur, {'id': row[0], 'name': row[1]} if row else None, 'login_failed',
                'staff', row[0] if row else None,
                f"Неудачный вход, логин «{login}»", ip, 'warning')
            conn.commit(); cur.close(); conn.close()
            return {'statusCode': 403, 'headers': out,
                    'body': json.dumps({'error': 'Неверный логин или пароль'}, ensure_ascii=False)}

        new_token = secrets.token_urlsafe(32)[:64]
        expires = (datetime.utcnow() + timedelta(hours=SESSION_HOURS)).strftime('%Y-%m-%d %H:%M:%S')
        ua = str(headers.get('User-Agent') or headers.get('user-agent') or '')[:240]
        cur.execute(
            "INSERT INTO staff_sessions (staff_id, token, ip, user_agent, expires_at) VALUES ("
            f"{row[0]}, {esc(new_token)}, {esc(ip)}, {esc(ua)}, '{expires}')"
        )
        cur.execute(f"UPDATE staff SET last_login_at = CURRENT_TIMESTAMP WHERE id = {row[0]}")
        staff = {'id': row[0], 'name': row[1], 'role': row[2]}
        log(cur, staff, 'login', 'staff', row[0], f"Вход в систему, IP {ip or 'неизвестен'}", ip)

        cur.execute(
            "UPDATE staff_sessions SET revoked = TRUE "
            "WHERE expires_at < CURRENT_TIMESTAMP AND revoked = FALSE")

        cur.execute(
            "SELECT COUNT(*) FROM backup_runs WHERE kind = 'auto' "
            "AND created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'")
        backup_due = cur.fetchone()[0] == 0
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out, 'body': json.dumps({
            'token': new_token, 'name': row[1], 'role': row[2], 'staffId': row[0],
            'mustChange': row[6], 'expiresInHours': SESSION_HOURS,
            'backupDue': backup_due,
        }, ensure_ascii=False)}

    staff = session_staff(cur, token)

    if method == 'POST' and action == 'logout':
        if token:
            cur.execute(f"UPDATE staff_sessions SET revoked = TRUE WHERE token = {esc(token)}")
            if staff:
                log(cur, staff, 'logout', 'staff', staff['id'], 'Выход из системы', ip)
            conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'success': True}, ensure_ascii=False)}

    if not staff:
        cur.close(); conn.close()
        return {'statusCode': 401, 'headers': out,
                'body': json.dumps({'error': 'Сессия истекла, войдите снова'}, ensure_ascii=False)}

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        if params.get('what') == 'me':
            cur.close(); conn.close()
            return {'statusCode': 200, 'headers': out,
                    'body': json.dumps({'staff': staff}, ensure_ascii=False)}

        if staff['role'] != 'director':
            cur.close(); conn.close()
            return {'statusCode': 403, 'headers': out,
                    'body': json.dumps({'error': 'Журнал доступен руководителю'}, ensure_ascii=False)}

        limit = min(int(params.get('limit') or 120), 500)
        who = params.get('staffId')
        sev = params.get('severity')
        where = []
        if who and who != 'all':
            where.append(f"staff_id = {int(who)}")
        if sev and sev != 'all':
            where.append(f"severity = {esc(sev)}")
        sql = ("SELECT id, staff_name, action, entity, entity_id, details, ip, severity, created_at "
               "FROM audit_log")
        if where:
            sql += " WHERE " + " AND ".join(where)
        sql += f" ORDER BY created_at DESC, id DESC LIMIT {limit}"
        cur.execute(sql)
        entries = [{
            'id': r[0], 'staffName': r[1], 'action': r[2], 'entity': r[3],
            'entityId': r[4], 'details': r[5], 'ip': r[6], 'severity': r[7],
            'createdAt': r[8].isoformat() if r[8] else None,
        } for r in cur.fetchall()]

        cur.execute(
            "SELECT id, name, login, role, active, last_login_at FROM staff ORDER BY id")
        team = [{
            'id': r[0], 'name': r[1], 'login': r[2], 'role': r[3],
            'roleLabel': ROLE_LABELS.get(r[3], r[3]), 'active': r[4],
            'lastLoginAt': r[5].isoformat() if r[5] else None,
        } for r in cur.fetchall()]

        cur.execute(
            "SELECT COUNT(*) FROM audit_log WHERE severity = 'warning' "
            "AND created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'")
        warnings = cur.fetchone()[0]

        cur.execute(
            "SELECT COUNT(*) FROM staff_sessions WHERE revoked = FALSE "
            "AND expires_at > CURRENT_TIMESTAMP")
        active_sessions = cur.fetchone()[0]

        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out, 'body': json.dumps({
            'entries': entries, 'team': team,
            'warnings': warnings, 'activeSessions': active_sessions,
        }, ensure_ascii=False), 'isBase64Encoded': False}

    if method == 'POST' and action == 'changePassword':
        new_pass = str(body.get('newPassword') or '')
        if len(new_pass) < 6:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': out,
                    'body': json.dumps({'error': 'Пароль от 6 символов'}, ensure_ascii=False)}

        cur.execute(
            f"SELECT pass_hash, pass_salt, must_change FROM staff WHERE id = {staff['id']}")
        prow = cur.fetchone()
        if prow and not prow[2]:
            current = str(body.get('currentPassword') or '')
            if hash_pass(current, prow[1]) != prow[0]:
                log(cur, staff, 'password_change_failed', 'staff', staff['id'],
                    'Неверный текущий пароль при смене', ip, 'warning')
                conn.commit(); cur.close(); conn.close()
                return {'statusCode': 403, 'headers': out,
                        'body': json.dumps({'error': 'Текущий пароль неверный'},
                                           ensure_ascii=False)}
        if prow and hash_pass(new_pass, prow[1]) == prow[0]:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': out,
                    'body': json.dumps({'error': 'Новый пароль совпадает со старым'},
                                       ensure_ascii=False)}
        salt = secrets.token_hex(8)
        cur.execute(
            f"UPDATE staff SET pass_hash = {esc(hash_pass(new_pass, salt))}, "
            f"pass_salt = {esc(salt)}, must_change = FALSE WHERE id = {staff['id']}"
        )
        cur.execute(
            "UPDATE staff_sessions SET revoked = TRUE "
            f"WHERE staff_id = {staff['id']} AND revoked = FALSE AND token <> {esc(token)}")
        log(cur, staff, 'password_changed', 'staff', staff['id'],
            'Пароль изменён, другие сессии закрыты', ip, 'warning')
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'success': True}, ensure_ascii=False)}

    if method == 'POST' and action == 'log':
        log(cur, staff, str(body.get('logAction') or 'action')[:40],
            body.get('entity'), body.get('entityId'), body.get('details'),
            ip, body.get('severity') or 'info')
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'success': True}, ensure_ascii=False)}

    if staff['role'] != 'director':
        cur.close(); conn.close()
        return {'statusCode': 403, 'headers': out,
                'body': json.dumps({'error': 'Недостаточно прав'}, ensure_ascii=False)}

    if method == 'POST' and action == 'resetPassword':
        target = int(body.get('staffId'))
        temp = secrets.token_urlsafe(6)
        salt = secrets.token_hex(8)
        cur.execute(
            f"UPDATE staff SET pass_hash = {esc(hash_pass(temp, salt))}, "
            f"pass_salt = {esc(salt)}, must_change = TRUE WHERE id = {target}"
        )
        cur.execute(f"UPDATE staff_sessions SET revoked = TRUE WHERE staff_id = {target}")
        log(cur, staff, 'password_reset', 'staff', target,
            'Сброшен пароль сотрудника', ip, 'warning')
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'password': temp}, ensure_ascii=False)}

    if method == 'POST' and action == 'toggleStaff':
        target = int(body.get('staffId'))
        active = bool(body.get('active'))
        cur.execute(
            f"UPDATE staff SET active = {'TRUE' if active else 'FALSE'} WHERE id = {target}")
        if not active:
            cur.execute(f"UPDATE staff_sessions SET revoked = TRUE WHERE staff_id = {target}")
        log(cur, staff, 'staff_toggled', 'staff', target,
            'Доступ включён' if active else 'Доступ отключён', ip, 'warning')
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'success': True}, ensure_ascii=False)}

    if method == 'POST' and action == 'setRole':
        target = int(body.get('staffId'))
        role = body.get('role') if body.get('role') in ROLE_LABELS else 'manager'
        cur.execute(f"UPDATE staff SET role = {esc(role)} WHERE id = {target}")
        log(cur, staff, 'role_changed', 'staff', target,
            f"Новая роль: {ROLE_LABELS[role]}", ip, 'warning')
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': out,
                'body': json.dumps({'success': True}, ensure_ascii=False)}

    cur.close(); conn.close()
    return {'statusCode': 405, 'headers': out,
            'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False)}