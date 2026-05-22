-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password      VARCHAR(255)        NOT NULL,
    login_status  BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- Insurance clients
CREATE TABLE IF NOT EXISTS client (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    date_of_birth VARCHAR(50),
    address       TEXT,
    contact       VARCHAR(100),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Insurance policies linked to a client
CREATE TABLE IF NOT EXISTS insurance_policy (
    id              SERIAL PRIMARY KEY,
    client_id       INTEGER        NOT NULL REFERENCES client(id),
    type            VARCHAR(100)   NOT NULL,
    coverage_amount NUMERIC(12, 2) NOT NULL,
    premium         NUMERIC(12, 2) NOT NULL,
    start_date      DATE           NOT NULL,
    end_date        DATE           NOT NULL,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Claims against a policy
CREATE TABLE IF NOT EXISTS insurance_claim (
    id                   SERIAL PRIMARY KEY,
    insurance_policy_id  INTEGER     NOT NULL REFERENCES insurance_policy(id),
    description          TEXT,
    claim_status         VARCHAR(50) NOT NULL DEFAULT 'pending',
    claim_date           DATE        NOT NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for foreign key columns used in JOINs and WHERE clauses
CREATE INDEX IF NOT EXISTS idx_insurance_policy_client_id  ON insurance_policy(client_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claim_policy_id   ON insurance_claim(insurance_policy_id);
CREATE INDEX IF NOT EXISTS idx_users_email                 ON users(email);
