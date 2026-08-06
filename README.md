<div align="center">
  
  <img src="https://raw.githubusercontent.com/SahilAgroha/NexBank/main/frontend/public/vite.svg" alt="NexBank Logo" width="100"/>

  # 🏦 NexBank
  
  **Modern, Secure, and Scalable Digital Banking Platform**

  [![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=java&logoColor=white)](https://java.com)
  [![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
  [![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.2-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
  [![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 🌟 Overview

NexBank is a full-stack digital banking application built using a **Clean Modular Monolith Architecture**. It provides a robust, highly secure, and feature-rich platform simulating a real-world financial institution.

From opening an account with Cloudinary-backed KYC verification to performing double-entry ledger transactions, UPI transfers, and Razorpay gateway integrations — NexBank has it all.

---

## 🚀 Key Features

### 🛡️ Authentication & Security
- **JWT Authentication** with short-lived Access Tokens & Refresh Token rotation.
- **Email OTP Verification** (Powered by Redis & SendGrid) for registration and password resets.
- **Role-Based Access Control** (CUSTOMER vs ADMIN).

### 💳 Core Banking
- **Account Management:** Savings & Current accounts with real-time balance.
- **Double-Entry Ledger:** ACID-compliant transactions ensuring zero financial mismatch.
- **Optimistic Locking:** `@Version` annotations to prevent concurrent modification anomalies.
- **Idempotency Keys:** Protection against duplicate transfers and network retries.

### 💸 Payments & Transfers
- **Fund Transfers:** Instant intra-bank transfers.
- **Beneficiary Management:** Secure adding of beneficiaries requiring OTP verification.
- **UPI & QR Code Payments:** Generate and scan dynamic QR codes.
- **Razorpay Integration:** Add funds securely via the Razorpay Sandbox gateway.

### 🚨 Fraud & Risk Engine
Real-time, rule-based fraud detection engine that automatically flags anomalies:
- **Velocity Checks:** > 5 transactions in 5 minutes.
- **Daily Limits:** Transactions exceeding ₹1,000,000 per day.
- **Large Transactions:** Single transfers above ₹500,000.
- **Blacklist Monitoring:** Transfers to known suspicious accounts.

### 📊 Admin & Auditing
- **Comprehensive Audit Trails:** Async JSONB state capture for all sensitive actions.
- **Admin Dashboard:** Approve/Reject KYC, freeze suspicious accounts, and resolve fraud alerts.

---

## 🛠️ Technology Stack

### Backend
* **Java 21** & **Spring Boot 3.3**
* **Spring Security & JWT** for stateless authentication
* **Spring Data JPA & Hibernate**
* **PostgreSQL 16** (Primary Database)
* **Redis 7** (Caching & OTP Temporary Storage)
* **Flyway** (Database Migrations)
* **SendGrid** (Email Delivery) & **Cloudinary** (KYC Document Storage)

### Frontend
* **React 18** (Vite)
* **TypeScript** (Strict Mode)
* **Zustand** (Global State Management)
* **TailwindCSS 3** (Custom Glassmorphism & Dark Mode Design System)
* **React Query** (Server State & Caching)
* **Recharts** (Financial Data Visualization)
* **React Hook Form & Zod** (Validation)

### DevOps
* **Docker & Docker Compose**
* **GitHub Actions** (CI/CD Pipeline with Automated Testing)
* **Nginx** (Frontend Production Build)

---

## 🏛️ Architecture

NexBank follows a **Domain-Driven Modular Monolith** structure. The application is a single deployable unit but strictly separated into 11 bounded contexts:

```text
com.nexbank
├── admin         # Administrative actions
├── account       # Double-entry ledger & account management
├── audit         # JSONB history tracking
├── auth          # JWT & session handling
├── beneficiary   # Payee management
├── common        # Shared utils, enums, global exception handling
├── config        # Spring configurations
├── customer      # Profiles & KYC processing
├── fraud         # Real-time anomaly detection rules
├── notification  # Async email & in-app alerts
├── payment       # Razorpay & external payment gateways
└── transaction   # Transfer processing with idempotency
```

---

## 🏃‍♂️ Getting Started (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Java 21+ & Maven

### 1. Environment Setup

Copy the example environment files and fill in your keys:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
*(You will need API keys for SendGrid, Cloudinary, and Razorpay Sandbox to enable full functionality).*

### 2. Start Infrastructure
Run the database and Redis instances via Docker:
```bash
docker compose up -d postgres redis
```

### 3. Run Backend
The application will automatically run Flyway migrations (`V1` to `V10`) on startup.
```bash
cd backend
mvn spring-boot:run
```

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` to view the application.

---

## 🧪 Testing

The backend includes a comprehensive suite of unit and integration tests.
```bash
cd backend
mvn test
```

The frontend enforces strict type-checking.
```bash
cd frontend
npm run type-check
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">
  <i>Built with passion for clean code and secure architecture.</i>
</div>