CREATE TABLE IF NOT EXISTS lead_documents (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id),
    doc_type VARCHAR(20) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    doc_no VARCHAR(50) NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lead_documents_lead_id ON lead_documents(lead_id);
