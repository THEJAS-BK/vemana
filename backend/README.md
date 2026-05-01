# Aethera — Fund Transparency Platform
## Backend & Blockchain Layer

---

## Prerequisites
| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | https://nodejs.org |
| MongoDB | ≥ 6 | https://www.mongodb.com/try/download/community |
| Python service | port 5001 | Already built (external) |

---

## Setup & Run (4 terminals)

### Terminal 1 — Install dependencies
```bash
cd backend
npm install
```

### Terminal 2 — Start MongoDB
```bash
# Windows
net start MongoDB

# Or if using mongod directly:
mongod --dbpath C:\data\db
```

### Terminal 3 — Start Hardhat local blockchain node
```bash
cd backend
npx hardhat node
```
> Keep this running. It gives you 20 funded test accounts.

### Terminal 4 — Deploy contract, then start API server
```bash
cd backend

# Deploy FundTracker contract to local Hardhat node
npm run deploy
# → Writes deployed.json and patches .env with CONTRACT_ADDRESS

# Start the Express API
npm start        # production
# OR
npm run dev      # with auto-reload (nodemon)
```

On first startup the server **auto-seeds 10 transactions** (7 clean + 3 flagged) onto the blockchain and into MongoDB.

---

## API Endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Live status: blockchain / mongodb / python |
| GET | `/api/transactions` | All transactions |
| GET | `/api/transactions?flagged=true` | Flagged transactions only |
| GET | `/api/transactions/:id` | Single transaction by blockchain ID |
| POST | `/api/transactions` | Create new transaction |
| GET | `/api/analytics` | Monthly totals, flagged count, total volume |
| GET | `/api/users` | Demo user list |
| POST | `/api/login` | Login → JWT token |

---

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@aethera.gov` | `admin` | admin |
| `auditor@aethera.gov` | `auditor` | auditor |
| `public@aethera.gov` | `public` | public |

---

## Quick Test (curl)

```bash
# Health
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aethera.gov","password":"admin"}'

# All transactions
curl http://localhost:5000/api/transactions

# Flagged only
curl http://localhost:5000/api/transactions?flagged=true

# Create a transaction
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"sender":"Ministry of Finance","receiver":"NITI Aayog","amount":750000}'

# Analytics
curl http://localhost:5000/api/analytics
```

---

## Project Structure

```
backend/
├── contracts/
│   └── FundTracker.sol          # Solidity smart contract
├── scripts/
│   └── deploy.js                # Hardhat deploy script
├── routes/
│   ├── transactions.js
│   ├── analytics.js
│   └── auth.js
├── controllers/
│   ├── transactionController.js
│   ├── analyticsController.js
│   └── authController.js
├── middleware/
│   └── auth.js                  # JWT middleware
├── models/
│   └── Transaction.js           # Mongoose schema
├── services/
│   ├── blockchainService.js     # ethers.js wrapper
│   └── pythonService.js         # Python /detect bridge
├── seed/
│   └── seedTransactions.js      # 10 demo transactions
├── hardhat.config.js
├── server.js                    # Express entry point
├── deployed.json                # Auto-generated after deploy
└── .env
```

---

## Environment Variables (`.env`)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/aethera
CONTRACT_ADDRESS=           ← auto-filled by deploy script
HARDHAT_NETWORK_URL=http://127.0.0.1:8545
JWT_SECRET=aethera_hackathon_secret_2025
PYTHON_SERVICE_URL=http://localhost:5001
```
