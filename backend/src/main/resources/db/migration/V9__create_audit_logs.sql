-- V9: Audit Logs
CREATE TABLE audit_logs (
    id           VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    actor        VARCHAR(255) NOT NULL,
    actor_role   VARCHAR(20),
    action       VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(50),
    entity_id    VARCHAR(36),
    before_state JSONB,
    after_state  JSONB,
    ip_address   VARCHAR(45),
    details      VARCHAR(1000),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON audit_logs(actor);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
