-- Run this once in the Supabase SQL Editor to create the table.

CREATE TABLE IF NOT EXISTS hcp_prescriptions (
    id                bigserial PRIMARY KEY,
    prscrbr_npi       text        NOT NULL,
    prscrbr_last      text,
    prscrbr_first     text,
    prscrbr_city      text,
    prscrbr_state     text,
    prscrbr_type      text,
    brand_name        text,
    tot_clms          integer     DEFAULT 0,
    tot_30day_fills   numeric     DEFAULT 0,
    tot_day_suply     numeric     DEFAULT 0,
    tot_drug_cst      numeric     DEFAULT 0,
    tot_benes         integer     DEFAULT 0,
    ge65_flag         text
);

-- Index for the most common query patterns
CREATE INDEX IF NOT EXISTS idx_hcp_brand      ON hcp_prescriptions (brand_name);
CREATE INDEX IF NOT EXISTS idx_hcp_city       ON hcp_prescriptions (prscrbr_city);
CREATE INDEX IF NOT EXISTS idx_hcp_npi_brand  ON hcp_prescriptions (prscrbr_npi, brand_name);

-- (Optional) Row-Level Security — allow anonymous read, block writes
ALTER TABLE hcp_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_read" ON hcp_prescriptions
    FOR SELECT
    TO anon
    USING (true);
