CREATE TABLE IF NOT EXISTS placements (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NULL,
    plan_year INTEGER NOT NULL,
    plan_month INTEGER NOT NULL,
    row_no INTEGER NULL,
    brand VARCHAR(255) NOT NULL,
    legal_entity VARCHAR(255) NULL,
    agency VARCHAR(255) NULL,
    payment_type VARCHAR(32) NOT NULL DEFAULT 'paid',
    video_status VARCHAR(32) NOT NULL DEFAULT 'ready',
    duration_sec INTEGER NOT NULL DEFAULT 0,
    period_text VARCHAR(120) NULL,
    start_day INTEGER NULL,
    end_day INTEGER NULL,
    days_count INTEGER NOT NULL DEFAULT 0,
    price_total INTEGER NOT NULL DEFAULT 0,
    discount NUMERIC(5,2) NOT NULL DEFAULT 0,
    amount_month INTEGER NOT NULL DEFAULT 0,
    day_seconds TEXT NULL,
    note VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_placements_period ON placements(plan_year, plan_month);
CREATE INDEX IF NOT EXISTS idx_placements_lead ON placements(lead_id);

CREATE TABLE IF NOT EXISTS revenue_facts (
    id SERIAL PRIMARY KEY,
    fact_year INTEGER NOT NULL,
    fact_month INTEGER NOT NULL,
    amount NUMERIC(14,2) NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_revenue_period ON revenue_facts(fact_year, fact_month);

CREATE TABLE IF NOT EXISTS screen_settings (
    id INTEGER PRIMARY KEY,
    daily_capacity_sec INTEGER NOT NULL DEFAULT 300,
    screen_name VARCHAR(255) NOT NULL DEFAULT 'Светодиодный экран, Океанский пр-т, 16А'
);

INSERT INTO screen_settings (id, daily_capacity_sec)
VALUES (1, 300)
ON CONFLICT (id) DO NOTHING;