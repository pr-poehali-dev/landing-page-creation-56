UPDATE staff SET pass_hash = '3c1dc57e9443e0dab08ad319328987008af6c275580138a6130eace2948a0bd5', pass_salt = 'ed5e8496213400db', must_change = TRUE WHERE login = 'maksim';
UPDATE staff SET pass_hash = 'e4f79311b58a92963e79b1b480b4ba188250a0f8bc0acb9e7446100b1d9129f1', pass_salt = '241358b587f1dcdc', must_change = TRUE WHERE login = 'ekaterina';
UPDATE staff SET pass_hash = '8b7c5bf6d99c20d2181bc7e3e9b372a832715563c3fe775458e19b2daf5fac6d', pass_salt = '3c64d84f79b7623f', must_change = TRUE WHERE login = 'elena';

UPDATE staff_sessions SET revoked = TRUE WHERE revoked = FALSE;

INSERT INTO audit_log (staff_name, action, entity, details, severity)
VALUES ('Система', 'password_reset', 'staff', 'Выданы новые временные пароли всем сотрудникам', 'warning');