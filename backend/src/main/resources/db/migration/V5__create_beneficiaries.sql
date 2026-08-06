-- V5: Beneficiaries
CREATE TABLE beneficiaries (
    id             VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    customer_id    VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name           VARCHAR(100) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    ifsc_code      VARCHAR(11),
    bank_name      VARCHAR(100),
    verified       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, account_number)
);

CREATE INDEX idx_beneficiary_customer_id ON beneficiaries(customer_id);
