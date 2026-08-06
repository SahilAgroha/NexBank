-- V2: Customers
CREATE TABLE customers (
    id               VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id          VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth    DATE,
    gender           VARCHAR(10),
    pan_number       VARCHAR(10),
    aadhar_number    VARCHAR(12),
    occupation       VARCHAR(100),
    kyc_status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- Address (embedded)
    address_line1    VARCHAR(255),
    address_line2    VARCHAR(255),
    city             VARCHAR(100),
    state            VARCHAR(100),
    pincode          VARCHAR(10),
    country          VARCHAR(100),
    -- Nominee (embedded)
    nominee_name     VARCHAR(100),
    nominee_relation VARCHAR(50),
    nominee_dob      VARCHAR(20),
    nominee_phone    VARCHAR(15),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_user_id ON customers(user_id);

-- V2b: KYC Documents
CREATE TABLE kyc_documents (
    id                    VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    customer_id           VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    document_type         VARCHAR(50) NOT NULL,
    cloudinary_public_id  VARCHAR(255) NOT NULL,
    cloudinary_url        VARCHAR(500) NOT NULL,
    status                VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    rejection_reason      TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kyc_customer_id ON kyc_documents(customer_id);
