CREATE TABLE IF NOT EXISTS backups (
    id SERIAL PRIMARY KEY,
    period VARCHAR(20) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    leads_count INTEGER NOT NULL DEFAULT 0,
    docs_count INTEGER NOT NULL DEFAULT 0,
    total_sum BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backups_created_at ON backups(created_at DESC);