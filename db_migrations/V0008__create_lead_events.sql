CREATE TABLE IF NOT EXISTS lead_events (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    details VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lead_events_lead ON lead_events(lead_id, created_at DESC);

INSERT INTO lead_events (lead_id, event_type, details, created_at)
SELECT id, 'created',
       CASE WHEN source = 'manual' THEN 'Добавлена вручную' ELSE 'Заявка с сайта' END,
       created_at
FROM leads;

INSERT INTO lead_events (lead_id, event_type, details, created_at)
SELECT lead_id,
       'document',
       CASE doc_type
            WHEN 'contract' THEN 'Договор'
            WHEN 'invoice' THEN 'Счёт'
            WHEN 'act' THEN 'Акт'
            ELSE doc_type
       END || COALESCE(' № ' || doc_no, ''),
       created_at
FROM lead_documents;