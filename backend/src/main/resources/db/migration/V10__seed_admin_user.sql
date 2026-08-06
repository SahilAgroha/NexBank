-- V10: Default Admin User
-- Password: Admin@123456 (BCrypt hash)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, enabled, email_verified, account_non_locked)
VALUES (
    uuid_generate_v4()::text,
    'admin@nexbank.com',
    '$2a$12$LzPq6.9FDJFZo.UlAHiLMuPQN5D68o8a0OiLJlT3bGIDhMuDCDdcy',
    'NexBank',
    'Admin',
    'ADMIN',
    TRUE,
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;
