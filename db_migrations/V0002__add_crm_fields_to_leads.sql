ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS company VARCHAR(255),
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS placement_amount INTEGER,
  ADD COLUMN IF NOT EXISTS video_amount INTEGER;

COMMENT ON COLUMN leads.status IS 'new, estimate, contract, payment, live, completed, lost';