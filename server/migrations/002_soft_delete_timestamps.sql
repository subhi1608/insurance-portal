-- server/migrations/002_soft_delete_timestamps.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE client
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE insurance_policy
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE insurance_claim
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER client_updated_at
  BEFORE UPDATE ON client
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER insurance_policy_updated_at
  BEFORE UPDATE ON insurance_policy
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER insurance_claim_updated_at
  BEFORE UPDATE ON insurance_claim
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_users_active            ON users(id)             WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_client_active            ON client(id)            WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_insurance_policy_active  ON insurance_policy(id)  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_insurance_claim_active   ON insurance_claim(id)   WHERE deleted_at IS NULL;
