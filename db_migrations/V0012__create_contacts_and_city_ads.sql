CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    company VARCHAR(250) NOT NULL,
    industry VARCHAR(60) NULL,
    category VARCHAR(250) NULL,
    profile VARCHAR(250) NULL,
    city VARCHAR(120) NULL,
    address VARCHAR(250) NULL,
    phone VARCHAR(150) NULL,
    email VARCHAR(150) NULL,
    site VARCHAR(250) NULL,
    note VARCHAR(500) NULL,
    source VARCHAR(60) NULL,
    channel VARCHAR(120) NULL,
    funnel_status VARCHAR(30) NOT NULL DEFAULT 'new',
    manager VARCHAR(120) NULL,
    price_sent BOOLEAN NOT NULL DEFAULT FALSE,
    was_client BOOLEAN NOT NULL DEFAULT FALSE,
    lead_id INTEGER NULL,
    last_touch_at TIMESTAMP NULL,
    next_touch_at DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contacts_industry ON contacts(industry);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(funnel_status);
CREATE INDEX IF NOT EXISTS idx_contacts_next ON contacts(next_touch_at);

CREATE TABLE IF NOT EXISTS contact_touches (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL,
    touch_type VARCHAR(30) NOT NULL DEFAULT 'call',
    result VARCHAR(30) NULL,
    comment VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_touches_contact ON contact_touches(contact_id);

CREATE TABLE IF NOT EXISTS city_ads (
    id SERIAL PRIMARY KEY,
    seen_date DATE NULL,
    screen_type VARCHAR(120) NULL,
    screen_address VARCHAR(250) NULL,
    brand VARCHAR(250) NOT NULL,
    company VARCHAR(250) NULL,
    ad_source VARCHAR(60) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_city_ads_brand ON city_ads(brand);