CREATE TABLE IF NOT EXISTS lead_payments (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount INTEGER NOT NULL,
    comment VARCHAR(255) NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at TIMESTAMP NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lead_payments_lead ON lead_payments(lead_id);