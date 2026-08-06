-- V7: Notifications
CREATE TABLE notifications (
    id         VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id    VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(30) NOT NULL,
    title      VARCHAR(200) NOT NULL,
    message    VARCHAR(1000) NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_user_id ON notifications(user_id);
CREATE INDEX idx_notification_unread ON notifications(user_id, is_read);
