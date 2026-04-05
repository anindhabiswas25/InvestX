# InvestX

Community-powered fractional investment platform for local businesses, built on Stellar + Soroban with AI-assisted business scoring and on-chain dividend distribution.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [System Architecture](#system-architecture)
- [Monorepo Structure](#monorepo-structure)
- [Tech Stack](#tech-stack)
- [User Flows](#user-flows)
- [API Surface](#api-surface)
- [Smart Contracts](#smart-contracts)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Stellar Testnet References](#stellar-testnet-references)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

Small businesses often face financing gaps, and local communities typically cannot participate in early-stage growth opportunities. InvestX addresses both sides by enabling compliant micro-investments in vetted businesses through tokenized ownership and transparent on-chain settlement.

At a high level, InvestX provides:

- Fractional investment campaigns represented as Soroban tokens
- AI-assisted business scoring for risk-aware decisions
- Escrow-backed fundraising and programmable payout logic
- Governance workflows for community-driven approvals and verification
- Dividend distribution tied to investment ownership

## Core Features

- **Role-based platform** for investors, business owners, and admins
- **KYC workflow** with identity document support for investor trust and compliance
- **Business onboarding** with profile data, documents, and media uploads
- **AI credit scoring** using Gemini to assist business screening
- **Tokenized fundraising** via Soroban contracts and Stellar wallets
- **Escrow release and refunds** based on campaign outcomes and deadlines
- **Dividend lifecycle** from revenue reporting to investor payout tracking
- **Governance module** for proposal voting, finalization, and participation analytics
- **Notification system** for proposal reminders and user activity updates

## System Architecture

```text
React Frontend (frontend/)
  -> Express API (backend/)
      -> MongoDB (users, businesses, proposals, dividends, notifications)
      -> Stellar + Soroban (token, escrow, governance, dividend contracts)
      -> External services (Gemini, Pinata/IPFS, Cloudinary, Resend)
```

## Monorepo Structure

```text
InvestX/
|- backend/                # Express API, business logic, services, MongoDB models
|- frontend/               # React web app for all roles
|- smart-contracts/        # Hardhat scripts + Soroban Rust contracts
|- docs/                   # Supplemental implementation notes and docs
|- TESTING-GUIDE.md        # Project-level test instructions
|- LOCAL-TESTING-GUIDE.md  # Local environment test walkthroughs
|- start-local.sh/.bat     # Convenience scripts for local startup
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, React Query, Axios |
| Backend | Node.js, Express 5, Mongoose, JWT |
| Database | MongoDB Atlas |
| Blockchain | Stellar Testnet, Soroban smart contracts |
| Smart contracts | Rust (Soroban), Hardhat scripts for deployment tooling |
| Wallet integration | Freighter (`@stellar/freighter-api`) |
| AI scoring | Google Gemini |
| File/media | Pinata (IPFS), Cloudinary |
| Messaging | Resend |

## User Flows

### Business Owner Flow

1. Register and connect wallet
2. Submit business application with required data/documents
3. Receive AI-assisted evaluation and governance/admin review
4. Launch tokenized campaign when approved
5. Submit revenue reports and participate in payout lifecycle

### Investor Flow

1. Register, complete KYC, and connect wallet
2. Browse approved businesses with campaign context
3. Initiate and confirm on-chain investment transactions
4. Track portfolio and dividend earnings
5. Vote on governance proposals and monitor outcomes

### Governance Flow

1. Proposal creation for business approvals/verification events
2. Community vote preparation and signed vote submission
3. Auto/manual proposal finalization by services/routes
4. Result publication, attestations, and leaderboard/stat updates

## API Surface

Base URL (local): `http://localhost:5000`

### Health and Config

- `GET /`
- `GET /api/health`
- `GET /api/config/public`

### Auth (`/api/auth`)

- `POST /register`
- `POST /login`
- `POST /wallet-connect`
- `POST /wallet-signup`
- `GET /me` (protected)
- `POST /logout` (protected)

### Users (`/api/users`)

- `GET /profile`
- `POST /kyc`
- `PUT /wallet`
- `GET /me/voting-power`
- `GET /me/notifications`
- `GET /me/notifications/count`
- `PUT /me/notifications/read-all`
- `PUT /me/notifications/:id`

### Businesses (`/api/businesses`)

- `GET /`
- `GET /success-stories`
- `GET /:id`
- `GET /my-businesses` (business owner)
- `POST /apply` (business owner)
- `POST /:id/revenue-report` (business owner)

### Investments (`/api/investments`)

- `POST /initiate`
- `POST /confirm`
- `GET /my-investments`
- `GET /on-chain-portfolio`
- `GET /business/:businessId` (admin)

### Dividends (`/api/dividends`)

- `GET /my-earnings`
- `GET /business/:businessId`
- `PUT /:id/verify` (admin)
- `POST /:id/distribute` (admin)
- `POST /:id/retry` (admin)

### Governance (`/api/governance`)

- `GET /stats`
- `GET /leaderboard`
- `GET /proposals`
- `GET /proposals/active`
- `GET /proposals/:id`
- `GET /proposals/:id/result`
- `GET /business/:id/attestations`
- `POST /proposals/:id/vote/prepare` (protected)
- `POST /proposals/:id/vote` (protected)
- `POST /proposals/:id/finalize` (protected)
- `GET /my-votes` (protected)
- `POST /verify/:businessId` (admin)

### Admin (`/api/admin`)

- `GET /stats`
- `GET /businesses/pending`
- `GET /businesses`
- `POST /businesses/:id/ai-score`
- `GET /dividend-records/pending`
- `GET /users`
- `PUT /users/:id/kyc`
- `POST /check-deadlines`

Note: Some legacy admin moderation/dividend endpoints are intentionally deprecated and return `410 Gone`, because those actions are now governance-driven.

## Smart Contracts

Soroban contracts are located in `smart-contracts/soroban-contracts/`:

- `business-token/` - business-specific token logic
- `escrow-contract/` - campaign escrow deposits, release, and refunds
- `dividend-contract/` - payout/distribution logic
- `governance-contract/` - proposal and voting logic
- `document-registry/` - document/attestation integrity workflows

Deployment and helper scripts are in `smart-contracts/scripts/`.

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas or local MongoDB instance
- Freighter wallet funded on Stellar testnet
- Rust + Soroban CLI (only required for contract build/deploy workflows)

### 1) Clone

```bash
git clone https://github.com/anindhabiswas25/InvestX.git
cd InvestX
```

### 2) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed:admin
npm run dev
```

### 3) Frontend

```bash
cd frontend
npm install
npm start
```

### 4) Smart Contracts (optional for local app run)

```bash
cd smart-contracts
npm install
npm run deploy:stellar
```

## Environment Variables

Create `backend/.env` and configure at least these values:

| Variable | Description |
|---|---|
| `PORT` | API server port (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | JWT lifetime (example: `7d`) |
| `FRONTEND_URL` | Frontend URL allowed by CORS |
| `STELLAR_NETWORK` | `testnet` or other configured network |
| `STELLAR_HORIZON_URL` | Horizon endpoint |
| `STELLAR_ADMIN_SECRET` | Admin Stellar secret key |
| `STELLAR_ADMIN_PUBLIC_ADDRESS` | Admin Stellar public address |
| `ESCROW_CONTRACT_ID` | Escrow contract ID |
| `INVX_TOKEN_CONTRACT_ID` | Governance token contract ID |
| `GEMINI_API_KEY` | Gemini API key |
| `PINATA_JWT` | Pinata JWT token |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary config |
| `CLOUDINARY_API_KEY` | Cloudinary config |
| `CLOUDINARY_API_SECRET` | Cloudinary config |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Sender email identity |

Frontend variables (if used) should be prefixed according to React tooling conventions and set in `frontend/.env`.

## Testing

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

### Smart Contracts

```bash
cd smart-contracts
npm test
cargo test --manifest-path soroban-contracts/Cargo.toml
```

## Stellar Testnet References

- Horizon: `https://horizon-testnet.stellar.org`
- Soroban RPC: `https://soroban-testnet.stellar.org`
- Explorer: `https://stellar.expert/explorer/testnet`
- Faucet: `https://laboratory.stellar.org/#account-creator?network=test`

## Troubleshooting

- If wallet connection fails, verify Freighter is on testnet and account is funded.
- If API calls fail with CORS, confirm `FRONTEND_URL` and `NODE_ENV` values.
- If on-chain actions fail, re-check contract IDs and admin keys in `backend/.env`.
- If contract scripts fail, ensure Soroban CLI/Rust toolchain is installed and on `PATH`.

## License

MIT
