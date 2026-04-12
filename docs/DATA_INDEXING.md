# InvestX — Data Indexing Approach

## Overview

InvestX uses a **dual-layer data strategy**: financial-truth data lives on Stellar (immutable, trustless), while readable metadata and aggregations live in MongoDB (fast queries, rich search).

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  User / Frontend                     │
└───────────────────────┬─────────────────────────────┘
                        │ REST API
┌───────────────────────▼─────────────────────────────┐
│                 Node.js Backend                      │
│   ┌──────────────────┐   ┌──────────────────────┐   │
│   │   MongoDB Atlas  │   │   Stellar Horizon    │   │
│   │  (metadata index)│   │   (on-chain truth)   │   │
│   └──────────────────┘   └──────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## On-Chain vs Off-Chain Data

| Data Type | Storage | Reason |
|-----------|---------|--------|
| Token balances | Stellar Ledger | Trustless, auditable |
| Transaction history | Stellar Ledger | Immutable record |
| Escrow state (funded/released/refunded) | Soroban Contract | Cryptographic guarantee |
| Governance votes | Soroban Contract | Tamper-evident |
| Dividend distributions | Soroban Contract | Verifiable payout logic |
| Document hashes (KYC, financials) | Soroban Contract | Tamper-evident anchoring |
| Raw documents (PDFs, images) | Pinata IPFS | Censorship-resistant, content-addressed |
| User profiles & metadata | MongoDB | Fast queries, PII management |
| Business listings & descriptions | MongoDB | Rich search, filtering |
| Notification state | MongoDB | Ephemeral, user-specific |
| AI risk scores | MongoDB | Derived data, reproducible |
| Investment records | MongoDB (+ on-chain hash reference) | Query performance |
| KYC verification status | MongoDB | Administrative workflow |

---

## MongoDB Collections & Schemas

### `users`
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (indexed, unique)",
  "passwordHash": "string",
  "role": "investor | business_owner | admin",
  "walletAddress": "string (indexed)",
  "kycStatus": "pending | verified | rejected",
  "kycDocuments": { "selfieUrl": "string", "aadhaarUrl": "string", "panNumber": "string" },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `businesses`
```json
{
  "_id": "ObjectId",
  "name": "string (text-indexed)",
  "ownerId": "ObjectId → users",
  "category": "string (indexed)",
  "description": "string (text-indexed)",
  "targetAmountINR": "number",
  "raisedAmountINR": "number",
  "revenueSharePercentage": "number",
  "status": "pending | approved | fundraising | funded | rejected",
  "tokenAddress": "string (Stellar contract ID)",
  "escrowAddress": "string (Stellar contract ID)",
  "governanceProposalId": "string",
  "aiRiskScore": "number",
  "aiRiskReport": "string",
  "documents": ["string (IPFS CID)"],
  "createdAt": "Date"
}
```

### `investments`
```json
{
  "_id": "ObjectId",
  "investorId": "ObjectId → users",
  "businessId": "ObjectId → businesses",
  "amountINR": "number",
  "xlmAmount": "number",
  "tokensPurchased": "number",
  "transactionHash": "string (Stellar tx hash)",
  "status": "pending | confirmed | failed",
  "investedAt": "Date"
}
```

### `dividends`
```json
{
  "_id": "ObjectId",
  "businessId": "ObjectId → businesses",
  "investorId": "ObjectId → users",
  "amountXLM": "number",
  "revenueVerificationTxHash": "string",
  "distributionTxHash": "string",
  "paidAt": "Date"
}
```

### `governance_proposals`
```json
{
  "_id": "ObjectId",
  "onChainProposalId": "string",
  "type": "BusinessApproval | RevenueVerification",
  "businessId": "ObjectId → businesses",
  "status": "active | passed | rejected | executed",
  "upvotes": "number",
  "downvotes": "number",
  "expiresAt": "Date",
  "createdAt": "Date"
}
```

### `notifications`
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId → users",
  "type": "string",
  "message": "string",
  "read": "boolean",
  "createdAt": "Date"
}
```

---

## Stellar Horizon Indexing

The backend uses the **Stellar Horizon REST API** and **Stellar SDK** to index on-chain data:

### Token Balance Lookup
```javascript
const account = await stellarServer.loadAccount(walletAddress);
const holding = account.balances.find(b => b.asset_code === businessTokenCode);
```

### Transaction History
Horizon provides paginated transaction history per account or per contract:
```http
GET https://horizon-testnet.stellar.org/accounts/{address}/transactions?limit=200&order=desc
```

### Event Listening (Soroban)
Soroban contract events are streamed via `pollEvents` or Horizon `/effects` endpoint:
```javascript
server.effects().limit(200).order('desc').call();
```

---

## Search & Filtering Strategy

### Text Search (MongoDB)
A compound text index on `businesses` enables full-text search:
```javascript
db.businesses.createIndex(
  { name: "text", description: "text", category: "text" },
  { weights: { name: 3, category: 2, description: 1 } }
);
```

### Filtering Indexes
```javascript
db.businesses.createIndex({ status: 1, category: 1 });
db.investments.createIndex({ investorId: 1, status: 1 });
db.dividends.createIndex({ investorId: 1, paidAt: -1 });
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });
```

---

## Data Synchronization

On-chain state is the **source of truth**. MongoDB is a **read cache and metadata store**.

| Trigger | Action |
|---------|--------|
| Governance proposal executed | Backend updates `businesses.status` and `governance_proposals.status` |
| Escrow deposit confirmed | Backend creates `investments` record with `confirmed` status |
| Dividend distributed on-chain | Backend creates `dividends` records per holder |
| KYC approved | Admin updates `users.kycStatus` = `verified` |

All transaction hashes stored in MongoDB link back to the authoritative Stellar ledger entry.
