<div align="center">
  
  <img src="https://raw.githubusercontent.com/SahilAgroha/NexBank/main/frontend/public/vite.svg" alt="NexBank Logo" width="120" style="margin-bottom: 20px;"/>

  # 🏦 NexBank - Next Generation Digital Banking

  **A Modern, Secure, and Highly Scalable FinTech Platform**

  <p align="center">
    <a href="https://github.com/SahilAgroha/NexBank/stargazers"><img src="https://img.shields.io/github/stars/SahilAgroha/NexBank?style=for-the-badge&color=FBBF24" alt="Stars" /></a>
    <a href="https://github.com/SahilAgroha/NexBank/network/members"><img src="https://img.shields.io/github/forks/SahilAgroha/NexBank?style=for-the-badge&color=3B82F6" alt="Forks" /></a>
    <a href="https://github.com/SahilAgroha/NexBank/issues"><img src="https://img.shields.io/github/issues/SahilAgroha/NexBank?style=for-the-badge&color=EF4444" alt="Issues" /></a>
    <a href="https://github.com/SahilAgroha/NexBank/blob/main/LICENSE"><img src="https://img.shields.io/github/license/SahilAgroha/NexBank?style=for-the-badge&color=10B981" alt="License" /></a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=java&logoColor=white" alt="Java"/>
    <img src="https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot"/>
    <img src="https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
    <img src="https://img.shields.io/badge/TypeScript-5.2-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
    <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  </p>

  <i>Experience seamless banking with real-time transactions, robust security, and an elegant user interface.</i>
</div>

---

## 📑 Table of Contents
- [🌟 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [💻 Tech Stack](#-tech-stack)
- [🏛️ Architecture](#-architecture)
- [🚀 Quick Start (Local Setup)](#-quick-start-local-setup)
- [🌐 Deployment Guide](#-deployment-guide)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## 🌟 Overview

NexBank is a full-stack digital banking application built using a **Clean Modular Monolith Architecture**. It provides a robust, highly secure, and feature-rich platform simulating a real-world financial institution.

From opening an account with **Cloudinary-backed KYC verification** to performing **double-entry ledger transactions**, **UPI transfers**, and **Razorpay gateway integrations** — NexBank has it all.

---

## ✨ Key Features

### 🛡️ Uncompromised Security
- **Stateless Authentication:** JWT-based auth with short-lived Access Tokens & Refresh Token rotation.
- **Two-Factor Auth (OTP):** Email OTP Verification powered by Redis & SendGrid for registration and password resets.
- **Role-Based Access Control:** Strict separation between `CUSTOMER` and `ADMIN` privileges.

### 💳 Core Banking Operations
- **Account Management:** Open Savings & Current accounts and track real-time balances.
- **Double-Entry Ledger:** ACID-compliant transactions ensuring absolute zero financial mismatch.
- **Concurrency Control:** Optimistic Locking (`@Version`) to prevent concurrent modification anomalies.
- **Idempotency Checks:** Protection against duplicate transfers and network retries.

### 💸 Payments & Transfers
- **Instant Fund Transfers:** Lightning-fast intra-bank transfers.
- **Beneficiary Management:** Secure adding of payees requiring OTP verification.
- **UPI & QR Codes:** Generate and scan dynamic QR codes for payments.
- **External Top-ups:** Add funds securely via the Razorpay gateway.

### 🚨 AI-Ready Fraud Engine
A real-time, rule-based fraud detection engine that automatically flags anomalies:
- ⏱️ **Velocity Checks:** > 5 transactions in 5 minutes.
- 💰 **Daily Limits:** Transactions exceeding ₹1,000,000 per day.
- 🐳 **Whale Tracking:** Single transfers above ₹500,000.
- 🛑 **Blacklist Monitoring:** Transfers to known suspicious accounts.

### 📊 Admin Control Center
- **KYC Verification Studio:** Review user documents and approve/reject profiles.
- **Audit Trails:** Async JSONB state capture for all sensitive actions.
- **Risk Mitigation:** Freeze suspicious accounts and resolve fraud alerts seamlessly.

---

## 💻 Tech Stack

### ⚙️ Backend (The Engine)
* **Java 21** & **Spring Boot 3.3**
* **Spring Security & JWT** (Stateless Authentication)
* **Spring Data JPA & Hibernate**
* **PostgreSQL 16** (Primary ACID Database)
* **Redis 7** (Caching & OTP Temporary Storage)
* **Flyway** (Database Migrations)
* **3rd Party Integrations:** SendGrid (Emails), Cloudinary (KYC Docs), Razorpay (Payments)

### 🎨 Frontend (The Canvas)
* **React 18** (Powered by Vite)
* **TypeScript** (Strict Mode)
* **Zustand** (Global State Management)
* **TailwindCSS 3** (Custom Glassmorphism & Dark Mode Design System)
* **React Query** (Server State & API Caching)
* **Recharts** (Financial Data Visualization)
* **React Hook Form & Zod** (Bulletproof Validation)

### 🚢 DevOps & Infrastructure
* **Docker & Docker Compose** (Containerization)
* **GitHub Actions** (CI/CD Pipelines)
* **Multi-Stage Dockerfiles** (Optimized Java builds)

---

## 🏛️ Architecture

NexBank follows a **Domain-Driven Modular Monolith** structure. The application is a single deployable unit but strictly separated into bounded contexts:

```text
com.nexbank
├── admin         # Administrative actions & dashboard APIs
├── account       # Double-entry ledger & account management
├── audit         # JSONB history & state tracking
├── auth          # JWT, Session & OTP handling
├── beneficiary   # Payee management
├── common        # Shared utils, enums, global exception handling
├── config        # Spring & Security configurations
├── customer      # Profiles & KYC processing
├── fraud         # Real-time anomaly detection rules
├── notification  # Async email & in-app alerts
├── payment       # Razorpay & external payment gateways
└── transaction   # Transfer processing with idempotency keys
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Java 21+ & Maven

### 1. Environment Setup
Clone the repository and copy the example environment files:
```bash
git clone https://github.com/SahilAgroha/NexBank.git
cd NexBank

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
*(You will need API keys for SendGrid, Cloudinary, and Razorpay to enable full functionality).*

### 2. Start Infrastructure
Run the PostgreSQL database and Redis instances via Docker:
```bash
docker compose up -d postgres redis
```

### 3. Run the Backend
The application will automatically run Flyway migrations on startup to build the schema.
```bash
cd backend
mvn spring-boot:run
```

### 4. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` to experience NexBank.

---

## 🌐 Deployment Guide

NexBank is configured for seamless deployment on cloud platforms.

### 1. Backend (Render / Railway / AWS)
The backend is Docker-ready. Link your repository to your cloud provider, select **Docker** environment, and add the required environment variables:
- `SPRING_PROFILES_ACTIVE=prod`
- `FRONTEND_URL=https://your-vercel-app.vercel.app` (Strict CORS Security)
- Database credentials (e.g., Supabase PostgreSQL)
- API Keys (JWT Secret, Razorpay, Cloudinary, SMTP)

### 2. Frontend (Vercel / Netlify)
Import the `frontend` folder into Vercel and configure the environment variable:
- `VITE_API_URL=https://your-backend-url.onrender.com/api`

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <br>
  <i>Built with passion for clean code, elegant design, and secure architecture.</i>
  <br>
  <b>NexBank © 2024</b>
</div>