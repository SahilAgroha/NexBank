-- V3: Accounts & Ledger
CREATE TABLE accounts (
    id             VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    customer_id    VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type   VARCHAR(20) NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    balance        NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    ifsc_code      VARCHAR(11) DEFAULT 'NEXB0001001',
    branch         VARCHAR(100) DEFAULT 'NexBank Main Branch',
    version        BIGINT NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_accounts_customer_id ON accounts(customer_id);

CREATE TABLE ledger_entries (
    id             VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    account_id     VARCHAR(36) NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    transaction_id VARCHAR(36),
    entry_type     VARCHAR(10) NOT NULL, -- DEBIT / CREDIT
    amount         NUMERIC(15,2) NOT NULL,
    balance_after  NUMERIC(15,2) NOT NULL,
    description    VARCHAR(255),
    reference      VARCHAR(100),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ledger_account_id ON ledger_entries(account_id);
CREATE INDEX idx_ledger_transaction_id ON ledger_entries(transaction_id);
