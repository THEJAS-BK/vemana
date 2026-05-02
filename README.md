# 🌌 Aethera: Institutional Fund Governance Portal

**Aethera** is a next-generation, blockchain-powered fiscal oversight platform designed for the transparent management and auditing of institutional fund transfers. By combining **Immutable Ledger Technology** with **Real-time AI Fraud Detection**, Aethera ensures every rupee of government allocation is accounted for, verified, and protected.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User((Auditor/Admin)) -->|React + Vite| Frontend[Aethera Audit Portal]
    Frontend -->|REST API| Backend[Express Gateway]
    Backend -->|Ethers.js| Chain[Hardhat Blockchain]
    Backend -->|Mongoose| DB[(MongoDB)]
    Backend -->|FastAPI Client| AI[Python AI Service]gfgs
    AI -->|Heuristic + ML| Backend
```

### 🛠️ Technology Stack
-   **Frontend**: React 18, Tailwind CSS, Lucide Icons, Framer Motion.
-   **Backend**: Node.js, Express.js, JWT Authentication.
-   **Blockchain**: Solidity, Hardhat, Ethers.js v6.
-   **AI Microservice**: Python, FastAPI, Pydantic (Neural Fraud Detection).
-   **Database**: MongoDB (Metadata storage & Analytics).

---

## 🚀 Quick Start Guide

### 1. Prerequisite Infrastructure
Ensure you have the following installed and running:
-   **Node.js** (v18+)
-   **Python** (3.10+)
-   **MongoDB** (Local instance on `localhost:27017`)

### 2. Blockchain & Backend Setup
```bash
cd backend
npm install
# In separate terminals:
npx hardhat node       # Terminal 1: Starts Local Blockchain
npm run deploy         # Terminal 2: Deploys Smart Contracts
npm start              # Terminal 3: Starts Express API (Auto-seeds data)
```

### 3. Python AI Service (Fraud Detection)
```bash
cd python_service
python -m venv venv    # Create virtual environment
.\venv\Scripts\activate # Activate (Windows)
pip install fastapi uvicorn pydantic
python app.py          # Starts AI Service on Port 5001
```

### 4. Frontend Audit Portal
```bash
cd frontend
npm install
npm run dev            # Starts Dev Server on http://localhost:3000
```

---

## 🛡️ Key Platform Features

### 1. Role-Based Access Control (RBAC)
Aethera enforces strict data boundaries:
-   **Admin**: Full oversight, transaction simulation, and user management.
-   **Auditor**: Full registry access and certificate generation.
-   **Public**: Transparency-level view (Masked sensitive AI analysis).

### 2. Neural Fraud Analysis
Every transaction undergoes a dual-layer check:
-   **Local Heuristic Scan**: Immediate threshold and round-number validation.
-   **Python ML Service**: Advanced outlier detection using statistical models.

### 3. Smart Institutional Certificates
Generate high-fidelity, blockchain-verified PDF certificates for legal or audit documentation directly from the browser with professional `@media print` styling.

---

## 🔑 Demo Access

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@aethera.gov` | `admin` |
| **Auditor** | `auditor@aethera.gov` | `auditor` |
| **Public** | `public@aethera.gov` | `public` |

---

## ⚖️ Governance & Compliance
-   **Immutability**: Once a transaction is settled on the Hardhat node, it cannot be altered.
-   **Auditability**: Every transaction carries a unique Blockchain Hash and Parent Hash for cryptographic traceability.

**Developed for the 2026 Institutional Governance Hackathon.**
# vemana
