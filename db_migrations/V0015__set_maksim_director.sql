UPDATE staff SET role = 'director' WHERE login = 'maksim';
UPDATE staff SET role = 'manager' WHERE login = 'ekaterina';

INSERT INTO audit_log (staff_name, action, entity, details, severity)
VALUES ('Система', 'role_changed', 'staff', 'Максим назначен руководителем, Екатерина — менеджером', 'warning');