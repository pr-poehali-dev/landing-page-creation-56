CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    login VARCHAR(60) NOT NULL UNIQUE,
    pass_hash VARCHAR(128) NOT NULL,
    pass_salt VARCHAR(32) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'manager',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    must_change BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff_sessions (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    ip VARCHAR(45) NULL,
    user_agent VARCHAR(250) NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON staff_sessions(token);

CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER NULL,
    staff_name VARCHAR(120) NULL,
    action VARCHAR(40) NOT NULL,
    entity VARCHAR(40) NULL,
    entity_id INTEGER NULL,
    details VARCHAR(600) NULL,
    ip VARCHAR(45) NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'info',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_staff ON audit_log(staff_id);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_log(severity);

CREATE TABLE IF NOT EXISTS trash_bin (
    id SERIAL PRIMARY KEY,
    entity VARCHAR(40) NOT NULL,
    entity_id INTEGER NOT NULL,
    title VARCHAR(250) NULL,
    payload TEXT NOT NULL,
    removed_by VARCHAR(120) NULL,
    restore_until DATE NOT NULL,
    restored BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trash_entity ON trash_bin(entity, restored);

CREATE TABLE IF NOT EXISTS backup_runs (
    id SERIAL PRIMARY KEY,
    file_url VARCHAR(400) NULL,
    kind VARCHAR(20) NOT NULL DEFAULT 'manual',
    status VARCHAR(20) NOT NULL DEFAULT 'ok',
    note VARCHAR(300) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);