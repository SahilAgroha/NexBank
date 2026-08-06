-- V4: Transactions
CREATE TABLE transactions (
    id                VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    idempotency_key   VARCHAR(36) UNIQUE,
    reference         VARCHAR(50) NOT NULL,
    from_account_id   VARCHAR(36),
    to_account_id     VARCHAR(36),
    type              VARCHAR(30) NOT NULL,
    amount            NUMERIC(15,2) NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    description       VARCHAR(255),
    failure_reason    VARCHAR(255),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tx_from_account ON transactions(from_account_id);
CREATE INDEX idx_tx_to_account ON transactions(to_account_id);
CREATE INDEX idx_tx_idempotency_key ON transactions(idempotency_key);
CREATE INDEX idx_tx_reference ON transactions(reference);
CREATE INDEX idx_tx_created_at ON transactions(created_at);
