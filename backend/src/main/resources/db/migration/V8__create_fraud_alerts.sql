-- V8: Fraud Alerts
CREATE TABLE fraud_alerts (
    id              VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    account_id      VARCHAR(36) NOT NULL,
    transaction_id  VARCHAR(36),
    rule_triggered  VARCHAR(100) NOT NULL,
    description     VARCHAR(500),
    severity        VARCHAR(20) NOT NULL,
    resolved        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fraud_account_id ON fraud_alerts(account_id);
CREATE INDEX idx_fraud_resolved ON fraud_alerts(resolved);
