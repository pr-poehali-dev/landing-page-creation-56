INSERT INTO staff (name, login, pass_hash, pass_salt, role, must_change)
VALUES ('Администратор', 'admin', '8ca2a140303d25816d81857e8c33a1d8fe82d3661d930f6bdc430ed6da0c2f53', '8de9d74b78857cec', 'director', TRUE)
ON CONFLICT (login) DO UPDATE
SET pass_hash = EXCLUDED.pass_hash,
    pass_salt = EXCLUDED.pass_salt,
    role = 'director',
    active = TRUE,
    must_change = TRUE;

INSERT INTO audit_log (staff_name, action, entity, details, severity)
VALUES ('Система', 'staff_created', 'staff', 'Создан аккаунт администратора системы', 'warning');