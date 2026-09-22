CREATE TABLE IF NOT EXISTS screen_points (
    id SERIAL PRIMARY KEY,
    screen_type VARCHAR(120) NOT NULL,
    address VARCHAR(250) NOT NULL,
    operator VARCHAR(120) NULL,
    note VARCHAR(300) NULL,
    check_days INTEGER NOT NULL DEFAULT 7,
    last_checked_at TIMESTAMP NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watch_sources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    url VARCHAR(400) NOT NULL,
    kind VARCHAR(30) NOT NULL DEFAULT 'site',
    contact_id INTEGER NULL,
    keywords VARCHAR(300) NULL,
    last_checked_at TIMESTAMP NULL,
    last_hash VARCHAR(64) NULL,
    last_status VARCHAR(30) NULL,
    changed_at TIMESTAMP NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_watch_kind ON watch_sources(kind);

CREATE TABLE IF NOT EXISTS watch_signals (
    id SERIAL PRIMARY KEY,
    source_id INTEGER NULL,
    signal_type VARCHAR(30) NOT NULL DEFAULT 'change',
    title VARCHAR(300) NOT NULL,
    details VARCHAR(600) NULL,
    url VARCHAR(400) NULL,
    amount NUMERIC(14,2) NULL,
    deadline DATE NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_signals_read ON watch_signals(is_read, created_at);

INSERT INTO screen_points (screen_type, address, sort_order)
SELECT DISTINCT screen_type, screen_address, 0
FROM city_ads
WHERE screen_address IS NOT NULL AND screen_type IS NOT NULL;