# InvestX — Deployment Guide

> **Version:** 1.0  
> **Last Updated:** June 2025  
> **Network:** Celo Sepolia Testnet (Chain ID `11142220`)

---

## Deployed Contract Addresses (Current)

| # | Contract | Address | Purpose |
|---|---|---|---|
| 1 | Escrow | `0x371f3204316D79E2d4a93480C519cc23291956B1` | Holds investment CELO |
| 2 | INVXToken | `0xFC8659Be9815Cf1B07eD81F6d90a1c4EAde5b878` | Governance token (ERC-20) |
| 3 | RewardDistributor | `0x86E0d90A17Aa1D9E08C12411107a5Db06002aB5B` | Mints INVX rewards |
| 4 | DocumentRegistry | `0x82bc34CD7d2010c068E13AD981e8c7D5f7067B58` | On-chain doc verification |
| 5 | InvestXGovernance | `0xe9f34a5f85c048B239c57118ca6Da5fA90A46a7e` | Proposal + voting |
| 6 | DividendDistributor | `0x5430ceBfce96371d5F114e7CdDB38df5cF788eB0` | Auto dividend distribution |

**Admin Wallet:** `0x1111ca98D5a4E81fc691A5E023DD32795fd3F7Fc`

---

## Deployment Sequence (Order Matters!)

Dependencies between contracts require a specific deployment order. Each step depends on addresses from previous steps.

### Step 1 — Deploy INVXToken

```bash
cd smart-contracts
npx hardhat run scripts/deploy.js --network celoSepolia
```

| Parameter | Value |
|---|---|
| Dependencies | None |
| Constructor Args | None |
| Save | Address → `A1` |

### Step 2 — Deploy RewardDistributor

```bash
npx hardhat run scripts/deploy.js --network celoSepolia
```

| Parameter | Value |
|---|---|
| Dependencies | INVXToken address (`A1`), backend wallet address |
| Constructor Args | `(A1, backendWallet)` |
| Save | Address → `A2` |
| **Post-Deploy** | Call `INVXToken.setMinter(A2)` — grants minting permission |

### Step 3 — Deploy DocumentRegistry

```bash
npx hardhat run scripts/deploy.js --network celoSepolia
```

| Parameter | Value |
|---|---|
| Dependencies | None |
| Constructor Args | None |
| Save | Address → `A3` |
| **Post-Deploy** | Call `DocumentRegistry.addVerifier(backendWallet)` |

### Step 4 — Deploy InvestXGovernance

```bash
npx hardhat run scripts/deployGovernance.js --network celoSepolia
```

| Parameter | Value |
|---|---|
| Dependencies | INVXToken address (`A1`) |
| Constructor Args | `(A1)` |
| Save | Address → `A5` |

### Step 5 — Deploy DividendDistributor

```bash
npx hardhat run scripts/deployDividendDistributor.js --network celoSepolia
```

| Parameter | Value |
|---|---|
| Dependencies | InvestXGovernance address (`A5`) |
| Constructor Args | `(A5)` |
| Save | Address → `A6` |

### Step 6 — Deploy Escrow (if not already deployed)

```bash
npx hardhat run scripts/deploy.js --network celoSepolia
```

| Parameter | Value |
|---|---|
| Dependencies | None |
| Constructor Args | None |
| Save | Address → `A7` |

### Step 7 — Update Backend Configuration

Update `backend/src/config/governance.js` with all new contract addresses:

```javascript
const INVX_TOKEN_ADDRESS = 'A1';
const REWARD_DISTRIBUTOR_ADDRESS = 'A2';
const DOCUMENT_REGISTRY_ADDRESS = 'A3';
const GOVERNANCE_ADDRESS = 'A5';
const DIVIDEND_DISTRIBUTOR_ADDRESS = 'A6';
```

### Step 8 — Update Environment Variables

Add/update in `backend/.env`:

```env
# ─── Celo Network ─────────────────────────
CELO_RPC_URL=https://forno.celo-sepolia.celo-testnet.org
CHAIN_ID=11142220
ADMIN_PRIVATE_KEY=<your-admin-wallet-private-key>
ADMIN_WALLET_ADDRESS=0x1111ca98D5a4E81fc691A5E023DD32795fd3F7Fc

# ─── Contract Addresses ───────────────────
ESCROW_CONTRACT_ADDRESS=0x371f3204316D79E2d4a93480C519cc23291956B1
INVX_TOKEN_ADDRESS=0xFC8659Be9815Cf1B07eD81F6d90a1c4EAde5b878
REWARD_DISTRIBUTOR_ADDRESS=0x86E0d90A17Aa1D9E08C12411107a5Db06002aB5B
DOCUMENT_REGISTRY_ADDRESS=0x82bc34CD7d2010c068E13AD981e8c7D5f7067B58
GOVERNANCE_ADDRESS=0xe9f34a5f85c048B239c57118ca6Da5fA90A46a7e
DIVIDEND_DISTRIBUTOR_ADDRESS=0x5430ceBfce96371d5F114e7CdDB38df5cF788eB0

# ─── MongoDB ──────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/investx

# ─── JWT ──────────────────────────────────
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRE=7d

# ─── Cloudinary (for document uploads) ────
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# ─── Frontend ─────────────────────────────
FRONTEND_URL=http://localhost:3000

# ─── Server ──────────────────────────────
PORT=5000
NODE_ENV=development
```

### Step 9 — Install Backend Dependencies

```bash
cd backend
npm install
```

Required packages (already in `package.json`):
- `express`, `mongoose`, `cors`, `helmet`, `morgan`
- `bcryptjs`, `jsonwebtoken`, `dotenv`
- `ethers`, `axios`, `multer`, `cloudinary`
- `express-rate-limit`, `express-validator`

### Step 10 — Build Frontend

```bash
cd frontend
npm install
npm run build
```

The production build outputs to `frontend/build/`.

### Step 11 — Start the Backend

```bash
cd backend
npm run dev     # Development (with nodemon)
# or
npm start       # Production
```

Verify cron jobs are active:
```
🚀 InvestX Backend running on port 5000
📋 Cron: checking expired campaigns every hour
📋 Cron: finalizing proposals every 30 minutes
📋 Cron: checking pending businesses every hour
📋 Cron: sending vote reminders every hour
```

### Step 12 — Run Full Test Suite

```bash
# Smart contract tests
cd smart-contracts
npx hardhat test test/Governance.test.js
# Expected: 40 passing

# Backend integration tests (server must be running)
cd backend
node test/governance.test.js
# Expected: 15 passing
```

---

## Environment Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│         React 18.2 + Tailwind + RainbowKit          │
│              localhost:3000 / build/                 │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Governance│  │ Invest   │  │ Wallet Connect   │  │
│  │ Pages    │  │ Pages    │  │ (MetaMask/Celo)  │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │              │                 │             │
│       └──────────────┼─────────────────┘             │
│                      │ API Calls                     │
└──────────────────────┼───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                     BACKEND                           │
│           Node.js + Express + MongoDB                 │
│               localhost:5000                          │
│                                                       │
│  ┌────────────┐ ┌───────────────┐ ┌───────────────┐ │
│  │ Auth/User  │ │ Governance    │ │ Cron Services │ │
│  │ Routes     │ │ Routes        │ │               │ │
│  └────────────┘ └───────────────┘ │• Finalize     │ │
│                                   │• Check Pending│ │
│  ┌────────────┐ ┌───────────────┐ │• Vote Remind  │ │
│  │ Investment │ │ Dividend      │ │• Expire Camps │ │
│  │ Routes     │ │ Routes        │ └───────────────┘ │
│  └────────────┘ └───────────────┘                    │
│                      │                                │
│                      │ ethers.js                      │
└──────────────────────┼────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│              CELO SEPOLIA BLOCKCHAIN                  │
│              Chain ID: 11142220                       │
│                                                       │
│  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │ Escrow       │  │ INVXToken                    │  │
│  │ (CELO hold)  │  │ (Governance Token)           │  │
│  └──────────────┘  └──────────────────────────────┘  │
│                                                       │
│  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │ Reward       │  │ DocumentRegistry             │  │
│  │ Distributor  │  │ (Hash + Attestation store)   │  │
│  └──────────────┘  └──────────────────────────────┘  │
│                                                       │
│  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │ InvestX      │  │ DividendDistributor          │  │
│  │ Governance   │  │ (Auto CELO distribution)     │  │
│  └──────────────┘  └──────────────────────────────┘  │
│                                                       │
│  ┌──────────────────────────────────────────────────┐│
│  │ BusinessToken (deployed per approved business)   ││
│  └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

---

## Verify Deployment Checklist

| # | Check | Command / URL | Expected |
|---|---|---|---|
| 1 | INVXToken minter set | `INVXToken.minter()` | Returns RewardDistributor address |
| 2 | DocumentRegistry verifier | `DocumentRegistry.trustedVerifiers(backendWallet)` | `true` |
| 3 | Backend connects to MongoDB | Server start logs | `Database Connected: ...` |
| 4 | Governance contract reads INVX | `InvestXGovernance.invxToken()` | Returns INVXToken address |
| 5 | DividendDistributor linked | `DividendDistributor.governance()` | Returns Governance address |
| 6 | Frontend builds | `npm run build` | No errors |
| 7 | All API endpoints respond | `node test/governance.test.js` | All tests pass |
| 8 | Cron jobs run | Check server console logs | Finalize/check logs appear |
| 9 | Block explorer | `https://celo-sepolia.blockscout.com` | All contracts verified |

---

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| `Cannot estimate gas` | Contract not deployed or wrong address | Verify contract address in `.env` |
| `INVX: caller is not the minter` | `INVXToken.setMinter()` not called | Call `setMinter(RewardDistributorAddress)` |
| `DocumentRegistry: not a trusted verifier` | Backend wallet not added as verifier | Call `addVerifier(backendWalletAddress)` |
| `Governance: insufficient INVX` | User has 0 INVX balance | Earn INVX via KYC/investment/voting |
| MongoDB connection failed | Wrong URI or network issue | Check `MONGODB_URI` in `.env` |
| Frontend API 401 | JWT expired or missing | Re-login to get new token |
| Cron jobs not running | `setInterval` not started | Check `server.js` for cron initialization |
