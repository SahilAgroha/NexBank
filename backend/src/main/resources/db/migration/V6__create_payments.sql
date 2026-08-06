-- V6: Payments
CREATE TABLE payments (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    from_account_id     VARCHAR(36) NOT NULL,
    payment_type        VARCHAR(20) NOT NULL,
    amount              NUMERIC(15,2) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    merchant_id         VARCHAR(100),
    upi_id              VARCHAR(100),
    qr_data             VARCHAR(500),
    razorpay_order_id   VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    reference           VARCHAR(50) NOT NULL,
    description         VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_account_id ON payments(from_account_id);
CREATE INDEX idx_payments_razorpay_order ON payments(razorpay_order_id);
