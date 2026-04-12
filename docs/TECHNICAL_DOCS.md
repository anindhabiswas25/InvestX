# InvestX — Technical Documentation & API Reference

## Base URL

| Environment | URL |
|-------------|-----|
| Production | `https://investx-backend.onrender.com/api` |
| Local | `http://localhost:5000/api` |

All endpoints return JSON. Authenticated routes require `Authorization: Bearer <JWT>` header.

---

## Authentication

### `POST /auth/register`
Register a new user account.

**Body:**
```json
{
  "name": "Anindha Biswas",
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "investor"
}
```
**Response:** `201 Created` — `{ token, user }`

---

### `POST /auth/login`
Log in with email + password.

**Body:** `{ email, password }`  
**Response:** `200 OK` — `{ token, user }`

---

## KYC / Identity

### `POST /kyc/submit`
Submit KYC documents (multipart/form-data).

**Auth:** Required  
**Fields:** `selfie` (file), `aadhaar` (file), `pan` (string)  
**Response:** `200 OK` — `{ status: "pending" }`

---

### `GET /kyc/status`
Get the current user's KYC verification status.

**Auth:** Required  
**Response:** `{ kycStatus: "pending" | "verified" | "rejected" }`

---

## Businesses

### `GET /businesses`
List all DAO-approved businesses.

**Query params:** `?category=food&status=fundraising&page=1&limit=10`  
**Response:** `{ businesses: [...], total, page }`

---

### `GET /businesses/:id`
Get full details for a single business including token info.

**Response:** `{ business, tokenInfo, fundingProgress }`

---

### `POST /businesses/apply`
Business owner applies for funding.

**Auth:** Required (role: `business_owner`)  
**Body:** `{ name, description, category, targetAmountINR, revenueSharePercentage, documents[] }`  
**Response:** `201 Created` — `{ businessId, proposalId }`

---

## Investments

### `POST /investments/invest`
Invest in a business (triggers XLM escrow deposit).

**Auth:** Required  
**Body:** `{ businessId, amountINR, xlmAmount, transactionHash }`  
**Response:** `201 Created` — `{ investmentId, tokensPurchased }`

---

### `GET /investments/my`
Get the authenticated user's investment portfolio.

**Auth:** Required  
**Response:** `{ investments: [...] }`

---

### `GET /investments/portfolio/on-chain`
Fetch live on-chain token balances via Stellar SDK.

**Auth:** Required (must have wallet connected)  
**Response:** `{ holdings: [...], summary: { totalHoldingValueINR, totalDividendsINR } }`

---

## Dividends

### `GET /dividends/my`
Get dividend payout history for the authenticated investor.

**Auth:** Required  
**Response:** `{ payoutHistory: [...] }`

---

### `POST /dividends/distribute/:businessId`
Admin/DAO: trigger dividend distribution after revenue verification passes.

**Auth:** Required (admin)  
**Response:** `{ distributed: true, totalXLM, recipientsCount }`

---

## Governance

### `GET /governance/proposals`
List all active governance proposals.

**Response:** `{ proposals: [...] }`

---

### `GET /governance/proposals/:id`
Get full proposal details including vote counts.

**Response:** `{ proposal, votes: { upvotes, downvotes, status } }`

---

### `POST /governance/vote`
Cast a vote on a governance proposal (signed on-chain by Freighter).

**Auth:** Required  
**Body:** `{ proposalId, vote: "upvote" | "downvote", transactionHash }`  
**Response:** `{ success: true }`

---

## Admin

### `GET /admin/businesses/pending`
List businesses pending community approval.

**Auth:** Required (admin)  
**Response:** `{ businesses: [...] }`

---

### `POST /admin/businesses/:id/verify-revenue`
Submit revenue verification to trigger dividend proposal.

**Auth:** Required (admin)  
**Body:** `{ revenueAmountINR, xlmAmount, proofDocumentHash }`  
**Response:** `{ proposalId, status }`

---

## Error Codes

| Code | Meaning |
|------|---------|
| `400` | Bad request / validation failed |
| `401` | Not authenticated |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `422` | KYC not completed |
| `500` | Internal server error |

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
STELLAR_NETWORK=testnet
ADMIN_WALLET_SECRET=S...
GEMINI_API_KEY=AIza...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (`frontend/.env`)
```env
REACT_APP_API_URL=https://investx-backend.onrender.com/api
REACT_APP_STELLAR_EXPLORER_URL=https://stellar.expert/explorer/testnet
REACT_APP_GOVERNANCE_ADDRESS=CCIMHOZAMXQXJRJJXAMBX2GXSGP6BCU7YRLYTJ5IJ446XEJYEW56UBAH
```

---

## Smart Contract Interfaces (Soroban)

### Governance Contract
```rust
fn create_proposal(env, proposer, proposal_type, business_id) -> u32
fn vote(env, voter, proposal_id, upvote: bool)
fn execute_proposal(env, proposal_id)
fn get_proposal(env, proposal_id) -> Proposal
```

### Escrow Contract
```rust
fn deposit(env, investor, business_id, amount)
fn release(env, business_id)  // on funding success
fn refund(env, business_id)   // on funding failure
```

### Dividend Contract
```rust
fn deposit_revenue(env, business_id, amount)
fn distribute(env, business_id)
fn claim(env, investor, business_id)
```
