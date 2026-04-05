# InvestX — Fully Decentralized Governance + ZK Document Verification
## Complete End-to-End Implementation Guide

> **Target:** 10-user fully decentralized system on Celo Sepolia  
> **Goal:** Remove admin approval power entirely, replace with community voting + ZK document proofs  
> **Estimated Build Time:** 4 weeks

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Complete Architecture Diagram](#2-complete-architecture-diagram)
3. [New Smart Contracts Overview](#3-new-smart-contracts-overview)
4. [New Files & Folder Structure](#4-new-files--folder-structure)
5. [Phase 1 — INVX Governance Token](#5-phase-1--invx-governance-token)
6. [Phase 2 — Document Hash Registry](#6-phase-2--document-hash-registry)
7. [Phase 3 — Attestation & Verification Oracle](#7-phase-3--attestation--verification-oracle)
8. [Phase 4 — Zero-Knowledge Proof System](#8-phase-4--zero-knowledge-proof-system)
9. [Phase 5 — Governance Contract & Voting](#9-phase-5--governance-contract--voting)
10. [Phase 6 — Auto-Dividend Distributor Contract](#10-phase-6--auto-dividend-distributor-contract)
11. [Phase 7 — Backend: Governance APIs](#11-phase-7--backend-governance-apis)
12. [Phase 8 — Backend: Oracle & Cron Services](#12-phase-8--backend-oracle--cron-services)
13. [Phase 9 — Frontend: Governance Pages](#13-phase-9--frontend-governance-pages)
14. [Phase 10 — Remove Admin Control](#14-phase-10--remove-admin-control)
15. [Phase 11 — Notification System](#15-phase-11--notification-system)
16. [Phase 12 — Governance Analytics](#16-phase-12--governance-analytics)
17. [Testing Plan](#17-testing-plan)
18. [Deployment Sequence](#18-deployment-sequence)
19. [How Investor + Voter Roles Work Together](#19-how-investor--voter-roles-work-together)

---

## 1. System Overview

### Current System (Centralized)
```
Business applies → Admin reviews → Admin approves/rejects
Business earns → Admin verifies revenue → Admin distributes dividends
Everything depends on ONE admin wallet
```

### New System (Fully Decentralized)
```
Business applies → AI + Oracle verifies docs (ZK proofs) → Community votes
Business earns → ZK proof of revenue range → Community votes → Auto-distribute
No single person has approval power
Smart contracts enforce all rules
```

### The Three Pillars

```
PILLAR 1: INVX TOKEN (Voting Power)
├── Earned only through real actions (investing, voting, participation)
├── Cannot be bought — must be earned
├── More INVX = More voting weight (capped at 20% per person)
└── Aligns incentives: voters have skin in the game

PILLAR 2: ZK DOCUMENT VERIFICATION (Privacy + Transparency)
├── Documents never shown to voters
├── Hashes stored on-chain (tamper-proof)
├── Oracles verify claims: "GST is valid" (without showing GST number)
├── ZK range proofs: "Revenue > ₹30,000" (without revealing exact amount)
└── Voters make informed decisions without seeing sensitive data

PILLAR 3: GOVERNANCE SMART CONTRACT (Trustless Execution)
├── No admin can override a vote result
├── 3 minimum voters required (quorum for 10 users)
├── >60% approval threshold (stricter than 50% for small group)
├── Smart contract auto-executes: approve business, distribute dividends
└── Everything recorded on-chain, verifiable by anyone
```

---

## 2. Complete Architecture Diagram

### Full System Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INVESTX DECENTRALIZED SYSTEM                         │
│                                                                               │
│  ACTORS:  Business Owner | Investor/Voter | Smart Contracts | Oracles        │
└─────────────────────────────────────────────────────────────────────────────┘

╔══════════════════ BUSINESS APPLICATION FLOW ══════════════════╗
║                                                               ║
║  1. Business Owner submits application                        ║
║     └─ Form: name, category, goal, docs, revenue share       ║
║                                                               ║
║  2. Backend processes documents:                              ║
║     ├─ Upload originals to Cloudinary (admin-read-only)       ║
║     ├─ Encrypt & upload to IPFS via Pinata                    ║
║     ├─ Compute SHA-256 hash of each document                  ║
║     └─ Store hashes on-chain via DocumentRegistry contract    ║
║                                                               ║
║  3. Oracle service auto-verifies (no human involved):         ║
║     ├─ GST API check → attestation on-chain                   ║
║     ├─ PAN API check → attestation on-chain                   ║
║     ├─ Business age check → attestation + ZK proof on-chain   ║
║     ├─ AI risk score (Gemini) → attestation on-chain          ║
║     ├─ Document completeness → attestation on-chain           ║
║     └─ Funding goal reasonability → attestation on-chain      ║
║                                                               ║
║  4. All attestations complete → Auto-create governance        ║
║     proposal on InvestXGovernance contract                    ║
║                                                               ║
║  5. All INVX holders notified: "New vote: Chai Corner"        ║
║                                                               ║
║  6. Voting period: 2 days                                     ║
║     ├─ Voters see: verified claims, ZK proofs, AI score       ║
║     ├─ Voters DO NOT see: actual documents                    ║
║     └─ Vote weight = min(INVX balance, 20% of supply)         ║
║                                                               ║
║  7. Voting ends → Anyone calls finalizeProposal()             ║
║     ├─ < 3 unique voters → REJECTED (low participation)        ║
║     ├─ < 60% upvotes → REJECTED                               ║
║     └─ >= 3 voters AND >= 60% upvotes → PASSED                ║
║                                                               ║
║  8. If PASSED:                                                ║
║     ├─ Backend: status → "approved" → "fundraising"           ║
║     ├─ BusinessToken deployed on-chain                        ║
║     ├─ Correct voters rewarded: +3 INVX each                  ║
║     └─ Business owner notified                                ║
║                                                               ║
║  9. If REJECTED:                                              ║
║     ├─ Backend: status → "rejected"                           ║
║     ├─ Correct voters rewarded: +3 INVX each                  ║
║     ├─ Business owner notified with feedback                  ║
║     └─ Can resubmit after 7 days                             ║
╚═══════════════════════════════════════════════════════════════╝

╔══════════════════ FUNDRAISING FLOW (unchanged) ═══════════════╗
║                                                               ║
║  10. Token holders invest CELO → receive business tokens      ║
║      └─ Same as current system — no changes needed            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

╔══════════════════ REVENUE VERIFICATION FLOW ══════════════════╗
║                                                               ║
║  11. Business submits monthly revenue report:                 ║
║      ├─ Enters revenue amount (private)                       ║
║      ├─ Backend generates ZK range proof:                     ║
║      │   "Revenue > ₹30,000" (without revealing exact value)  ║
║      ├─ Business pays dividend CELO to DividendDistributor    ║
║      │   contract (not admin wallet)                          ║
║      └─ Backend stores ZK proof on-chain                      ║
║                                                               ║
║  12. Auto-create REVENUE_VERIFICATION proposal                ║
║      └─ Voters see: ZK proof result, previous months,        ║
║         AI anomaly detection, on-chain payment proof          ║
║                                                               ║
║  13. Voting period: 2 days                                    ║
║                                                               ║
║  14. If PASSED:                                               ║
║      └─ DividendDistributor contract auto-pays all investors  ║
║         proportional to their token holdings                  ║
║                                                               ║
║  15. If REJECTED:                                             ║
║      ├─ Funds held in DividendDistributor contract            ║
║      └─ Business must resubmit with supporting evidence       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

### Smart Contract Interaction Map

```
                    ┌─────────────────┐
                    │  INVXToken.sol   │
                    │  (ERC-20)        │
                    │  Voting power    │
                    └────────┬────────┘
                             │ balanceOf()
                             │ mint() [only RewardDistributor]
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
┌─────────────────┐  ┌──────────────┐  ┌────────────────────┐
│RewardDistrib-   │  │InvestXGover- │  │DocumentRegistry    │
│utor.sol         │  │nance.sol     │  │.sol                │
│                 │  │              │  │                    │
│Mints INVX for:  │  │vote()        │  │registerDocHash()   │
│- KYC            │  │createProposal│  │addAttestation()    │
│- Investment     │  │finalize()    │  │addRangeProof()     │
│- Dividends      │  │              │  │verifyIntegrity()   │
│- Voting         │  └──────┬───────┘  └────────────────────┘
└─────────────────┘         │
                             │ After PASSED:
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
┌─────────────────┐  ┌──────────────┐  ┌────────────────────┐
│BusinessToken    │  │Escrow.sol    │  │DividendDistrib-    │
│.sol             │  │(existing)    │  │utor.sol            │
│(existing)       │  │              │  │                    │
│Deployed after   │  │Release funds │  │Holds dividend CELO │
│vote approval    │  │to business   │  │Auto-pays investors │
└─────────────────┘  └──────────────┘  └────────────────────┘
```

### INVX Token Earning Flow

```
USER ACTION                     INVX EARNED    TRIGGER
─────────────────────────────────────────────────────────
Connect wallet + KYC verified → 5 INVX         Backend → RewardDistributor.mint()
First investment               → 10 INVX        Backend → RewardDistributor.mint()
Each additional investment     → 5 INVX         Backend → RewardDistributor.mint()
Receive dividend payout        → 3 INVX         DividendDistributor → RewardDistributor.mint()
Vote on any proposal           → 2 INVX         Backend (after vote tx confirmed)
Vote with winning majority     → 3 INVX bonus   Backend (after proposal finalized)
Refer investor who invested    → 5 INVX         Backend → RewardDistributor.mint()
```

---

## 3. New Smart Contracts Overview

```
smart-contracts/
└── contracts/
    ├── BusinessToken.sol          (EXISTING — unchanged)
    ├── Escrow.sol                 (EXISTING — minor update for auto-release)
    ├── INVXToken.sol              (NEW — governance token)
    ├── RewardDistributor.sol      (NEW — mints INVX for actions)
    ├── DocumentRegistry.sol       (NEW — stores doc hashes + attestations)
    ├── ZKRevenueVerifier.sol      (NEW — verifies ZK range proofs)
    └── InvestXGovernance.sol      (NEW — voting and proposal system)
    └── DividendDistributor.sol    (NEW — auto-distribute dividends)
```

**Governance Parameters for 10 Users:**

| Parameter | Value | Reason |
|---|---|---|
| Min voters (quorum) | 3 unique wallets | At least 30% of 10 users |
| Approval threshold | 60% | Stricter than 50% for small group |
| Voting duration | 2 days | Short enough to keep momentum |
| Max vote weight per person | 20% of total supply | No whale dominance |
| Emergency quorum | 5 voters | 50% of 10 users |
| Emergency approval | 80% | Near-unanimous for destructive actions |
| Min INVX to vote | 1 INVX | Low barrier to entry |
| Min INVX to propose | 1 INVX | Everyone can propose |

---

## 4. New Files & Folder Structure

### Smart Contracts — New Files
```
smart-contracts/
├── contracts/
│   ├── INVXToken.sol                    ← NEW
│   ├── RewardDistributor.sol            ← NEW
│   ├── DocumentRegistry.sol             ← NEW
│   ├── ZKRevenueVerifier.sol            ← NEW
│   ├── InvestXGovernance.sol            ← NEW
│   └── DividendDistributor.sol          ← NEW
├── circuits/                            ← NEW FOLDER (ZK circuits)
│   ├── revenueRange.circom              ← NEW
│   ├── businessAge.circom               ← NEW
│   └── fundingUtilization.circom        ← NEW
├── scripts/
│   ├── deploy.js                        (existing)
│   └── deployGovernance.js              ← NEW
└── test/
    ├── Governance.test.js               ← NEW
    └── DocumentRegistry.test.js         ← NEW
```

### Backend — New Files
```
backend/src/
├── config/
│   └── governance.js                    ← NEW (contract addresses + ABIs)
├── controllers/
│   └── governance.controller.js         ← NEW
├── models/
│   ├── Proposal.js                      ← NEW
│   ├── Vote.js                          ← NEW
│   ├── Notification.js                  ← NEW
│   └── INVXReward.js                    ← NEW
├── routes/
│   └── governance.routes.js             ← NEW
└── services/
    ├── invxReward.service.js            ← NEW
    ├── verificationOracle.service.js    ← NEW
    ├── zkProof.service.js               ← NEW
    ├── proposalCreator.service.js       ← NEW
    ├── proposalFinalizer.service.js     ← NEW
    └── notification.service.js          ← NEW
```

### Frontend — New Files
```
frontend/src/
├── pages/
│   └── governance/
│       ├── GovernancePage.jsx           ← NEW (main voting hub)
│       ├── ProposalDetailPage.jsx       ← NEW (vote on a proposal)
│       ├── MyVotesPage.jsx              ← NEW (voting history)
│       └── GovernanceAnalyticsPage.jsx  ← NEW (platform stats)
├── components/
│   └── governance/
│       ├── ProposalCard.jsx             ← NEW
│       ├── VotingPanel.jsx              ← NEW
│       ├── AttestationBadges.jsx        ← NEW
│       ├── ZKProofBadge.jsx             ← NEW
│       ├── INVXBalance.jsx              ← NEW
│       └── NotificationBell.jsx         ← NEW
└── services/
    └── governance.api.js                ← NEW
```

---

## 5. Phase 1 — INVX Governance Token

### Overview
Create the ERC-20 governance token that powers all voting. This token CANNOT be bought on any exchange — it is ONLY earned through participation.

### Step 1.1 — Write INVXToken.sol

**Location:** `smart-contracts/contracts/INVXToken.sol`

**Contract responsibilities:**
- Standard ERC-20 token named "InvestX Governance Token" (symbol: INVX)
- Only ONE address can mint tokens: the RewardDistributor contract
- Owner can update the minter address (for contract upgrades)
- `decimals()` returns 18 (standard)
- No max supply — minted on demand as rewards

**Key functions to implement:**
```
constructor(address initialOwner)
   → sets owner, no initial supply

setMinter(address _minter)
   → onlyOwner: sets who can mint

mint(address to, uint256 amount)
   → onlyMinter: creates new tokens
   → emit Transfer event

Standard ERC-20 functions (transfer, approve, allowance, etc.)
   → from OpenZeppelin ERC20 base
```

### Step 1.2 — Write RewardDistributor.sol

**Location:** `smart-contracts/contracts/RewardDistributor.sol`

**Contract responsibilities:**
- Called by trusted backend address to mint INVX rewards
- Manages reward amounts per action type
- Prevents double-rewarding (tracks rewarded actions)
- Owner can adjust reward amounts

**Reward action enum to define:**
```
enum RewardAction {
  KYC_VERIFIED,           // 5 INVX
  FIRST_INVESTMENT,       // 10 INVX
  ADDITIONAL_INVESTMENT,  // 5 INVX
  DIVIDEND_RECEIVED,      // 3 INVX
  VOTE_PARTICIPATION,     // 2 INVX
  VOTE_CORRECT,           // 3 INVX
  REFERRAL_INVESTMENT     // 5 INVX
}
```

**Key functions:**
```
rewardUser(address user, RewardAction action, bytes32 actionId)
   → onlyBackend: mint INVX to user
   → actionId prevents double-rewarding same event
   → emit Rewarded(user, action, amount, actionId)

setRewardAmount(RewardAction action, uint256 amount)
   → onlyOwner: update reward for specific action

hasBeenRewarded(bytes32 actionId) → bool
   → check if specific action already rewarded
```

**Backend address:** Store the backend wallet address as the trusted caller

### Step 1.3 — Deploy INVX Token + Reward Distributor

**Location:** `smart-contracts/scripts/deployGovernance.js`

**Deployment steps in script:**
1. Deploy `INVXToken` with deployer as initial owner
2. Deploy `RewardDistributor` with INVXToken address + backend wallet address
3. Call `invxToken.setMinter(rewardDistributor.address)` — give RewardDistributor mint rights
4. Save both addresses to a JSON file: `smart-contracts/deployed-governance.json`
5. Log all addresses and tx hashes

**Run deployment:**
```
cd smart-contracts
npx hardhat run scripts/deployGovernance.js --network celoSepolia
```

### Step 1.4 — Update Backend Config

**File:** `backend/src/config/governance.js`

**What to store:**
```javascript
module.exports = {
  INVX_TOKEN_ADDRESS: "0x...",
  REWARD_DISTRIBUTOR_ADDRESS: "0x...",
  DOCUMENT_REGISTRY_ADDRESS: "0x...",   // filled later
  GOVERNANCE_ADDRESS: "0x...",           // filled later
  DIVIDEND_DISTRIBUTOR_ADDRESS: "0x...", // filled later
  
  INVX_TOKEN_ABI: [...],
  REWARD_DISTRIBUTOR_ABI: [...],
  // etc.
  
  GOVERNANCE_PARAMS: {
    MIN_VOTERS: 3,
    APPROVAL_PERCENT: 60,
    EMERGENCY_APPROVAL: 80,
    EMERGENCY_MIN_VOTERS: 5,
    VOTING_DURATION_DAYS: 2,
    MAX_VOTE_WEIGHT_PERCENT: 20
  }
}
```

### Step 1.5 — Create INVXReward Service

**File:** `backend/src/services/invxReward.service.js`

**Function: `rewardUser(userId, action, actionId)`**
- Sub-steps:
  1. Look up user's wallet address from User model
  2. Check if `actionId` already rewarded (call `hasBeenRewarded` on contract)
  3. If not rewarded: call `rewardUser()` on RewardDistributor contract
  4. Wait for tx confirmation
  5. Store reward record in `INVXReward` MongoDB collection
  6. Return tx hash

**Call this service from:**
- `auth.controller.js` → after KYC verification complete
- `investment.controller.js` → after investment confirmed
- `dividend.controller.js` → after dividend received
- (voting rewards handled separately in governance flow)

### Step 1.6 — Create INVXReward Model

**File:** `backend/src/models/INVXReward.js`

**Fields:**
```
userId         → ObjectId (ref: User)
walletAddress  → String
action         → String (enum: the reward actions)
amount         → Number (INVX amount)
actionId       → String (unique, prevents double-reward)
txHash         → String (on-chain tx)
createdAt      → Date
```

**Index:** `actionId` must be unique

### Step 1.7 — Add INVX Balance to User API

**File:** `backend/src/controllers/user.controller.js`

**New endpoint: `GET /api/users/me/invx`**
- Sub-steps:
  1. Get user's wallet address from User model
  2. Call `invxToken.balanceOf(walletAddress)` on-chain
  3. Call `governanceContract.getVotingPower(walletAddress)` on-chain
  4. Return both (raw balance + effective voting power after cap)

### Step 1.8 — Show INVX Balance in Frontend

**Where to show:**
- Navbar: Small badge next to wallet address showing "X INVX ⚡"
- Investor Dashboard: "My Governance Power" card
- Governance Page: Shown prominently before voting

**File to update:** `frontend/src/components/governance/INVXBalance.jsx`

**Data to display:**
```
INVX Balance: 25 INVX
Voting Power: 15.5% (capped from 25%)
Rewards earned this month: 8 INVX
Rank: #3 out of 10 active voters
```

---

## 6. Phase 2 — Document Hash Registry

### Overview
Store cryptographic hashes of business documents on-chain. This proves documents exist and haven't been tampered with — WITHOUT revealing the documents themselves.

### Step 2.1 — Write DocumentRegistry.sol

**Location:** `smart-contracts/contracts/DocumentRegistry.sol`

**Contract responsibilities:**
- Store SHA-256 hash of each business document (indexed by businessId + docType)
- Store verification attestations (claims about documents without revealing them)
- Store ZK range proof results
- Anyone can verify a document hash → proves document integrity
- Only trusted verifiers can register hashes and attestations
- Immutable records — once stored, cannot be deleted

**Data structures to define:**

```
struct DocumentRecord {
  bytes32 documentHash       // SHA-256 of original document
  string  encryptedIpfsCid   // encrypted IPFS CID (only admin decrypts)
  uint256 uploadedAt
  bool    exists
}

struct Attestation {
  string             claim        // "GST number is valid and active"
  VerificationStatus status       // PENDING / VERIFIED / FAILED
  address            verifier     // who signed this attestation
  uint256            verifiedAt
  bytes32            proofHash    // hash of verification evidence
  string             method       // "api_oracle" / "manual" / "zk_proof"
}

enum VerificationStatus { PENDING, VERIFIED, FAILED }

struct RangeProof {
  string  claim                   // "Monthly revenue > ₹30,000"
  uint256 threshold               // the public threshold value
  bool    isAboveThreshold        // result: true/false
  bytes32 zkProofHash             // hash of the ZK proof
  uint256 verifiedAt
}
```

**Key functions:**
```
registerDocument(businessId, docType, docHash, encryptedCid)
   → onlyVerifier
   → stores DocumentRecord
   → emit DocumentRegistered(businessHash, docType, docHash)

addAttestation(businessId, claim, status, proofHash, method)
   → onlyVerifier
   → appends to attestations array
   → increments totalClaimCount / verifiedClaimCount
   → emit AttestationAdded(businessHash, claim, status)

addRangeProof(businessId, claim, threshold, isAbove, zkProofHash)
   → onlyVerifier
   → appends to rangeProofs array
   → emit RangeProofAdded(businessHash, claim, isAbove)

verifyDocumentIntegrity(businessId, docType, providedHash) → bool
   → public view
   → returns: does providedHash match stored hash?

getAttestations(businessId) → Attestation[]
   → public view
   → voters call this to see verified claims

getVerificationSummary(businessId) → (total, verified, rangeProofs)
   → public view
   → returns verification score

addVerifier(address) / removeVerifier(address)
   → onlyOwner
```

**Mappings to define:**
```
mapping(bytes32 => mapping(string => DocumentRecord)) public documents
   → businessHash → docType → DocumentRecord

mapping(bytes32 => Attestation[]) public attestations
   → businessHash → list of attestations

mapping(bytes32 => RangeProof[]) public rangeProofs
   → businessHash → list of ZK range proofs

mapping(bytes32 => uint256) public verifiedClaimCount
mapping(bytes32 => uint256) public totalClaimCount
mapping(address => bool) public trustedVerifiers
```

### Step 2.2 — Update Business Model

**File:** `backend/src/models/Business.js`

**Add new fields:**
```javascript
documentHashes: {
  gst: {
    hash: String,              // SHA-256 hex string
    txHash: String,            // on-chain registration tx
    registeredAt: Date
  },
  pan: { hash: String, txHash: String, registeredAt: Date },
  bankStatement: { hash: String, txHash: String, registeredAt: Date },
  registration: { hash: String, txHash: String, registeredAt: Date },
  businessPhoto: { hash: String, txHash: String, registeredAt: Date }
},
attestationStatus: {
  type: String,
  enum: ['pending', 'in_progress', 'complete', 'failed'],
  default: 'pending'
},
attestationTxHashes: [String],    // list of attestation tx hashes
proposalId: Number,               // governance proposal ID once created
```

### Step 2.3 — Update Business KYC Submission (Backend)

**File:** `backend/src/controllers/business.controller.js`
**Function:** `submitApplication` 

**Add after existing document upload:**

**Sub-step 2.3.1 — Hash documents**
- For each uploaded document (GST, PAN, bank statement, etc.):
  1. Read the file buffer from the upload
  2. Compute SHA-256 hash using Node.js `crypto.createHash('sha256')`
  3. Store hash as hex string

**Sub-step 2.3.2 — Register hashes on-chain**
- Call `documentRegistry.registerDocument()` for each document
- Store the returned tx hash in `business.documentHashes[type].txHash`
- Save business to database after all hashes registered

**Sub-step 2.3.3 — Trigger oracle service**
- Call `verificationOracle.startVerification(businessId)` (async, non-blocking)
- This triggers Phase 3 (attestation generation) in the background
- Business status stays 'pending' until oracle completes

### Step 2.4 — Document Integrity Verification Public Page (Frontend)

**Route:** `/verify/:businessId/documents`

**What to show on this page:**
```
Business: Chai Corner
Document Verification Record

┌────────────────────────────────────────────────────────┐
│ Document Type    │ On-chain Hash   │ Registered   │ Verify│
├────────────────────────────────────────────────────────┤
│ GST Certificate  │ 0x7f4a...2c9b  │ Mar 4, 2026  │  ✅  │
│ PAN Card         │ 0x3e8f...1a7d  │ Mar 4, 2026  │  ✅  │
│ Bank Statement   │ 0x9c2b...8e3f  │ Mar 4, 2026  │  ✅  │
│ Registration     │ 0xb4d5...7a2c  │ Mar 4, 2026  │  ✅  │
│ Business Photo   │ 0x5f1e...4b6d  │ Mar 4, 2026  │  ✅  │
├────────────────────────────────────────────────────────┤
│ All documents: On-chain verified                       │
│ CeloScan: View registration transactions →             │
└────────────────────────────────────────────────────────┘

ℹ️ Document contents are private. These hashes prove documents
   exist and haven't been tampered with since registration.
```

---

## 7. Phase 3 — Attestation & Verification Oracle

### Overview
An automated backend service that runs checks on business data and creates signed on-chain attestations. Voters see "GST is valid ✅" without ever seeing the GST number itself.

### Step 3.1 — Design Attestation Checks

**Six standard checks for every business:**

```
CHECK 1: GST NUMBER VALIDITY
  Input:  GST number (from application form — never shown to voters)
  Method: Call Indian GST verification API
          (hackathon: use mock/sandbox API or validate format regex)
  Claim:  "GST registration is valid and active"
  Output: VERIFIED or FAILED

CHECK 2: PAN NUMBER VALIDITY
  Input:  PAN number (private)
  Method: PAN verification API (or format validation for demo)
  Claim:  "PAN number matches the registered business owner"
  Output: VERIFIED or FAILED

CHECK 3: BUSINESS AGE
  Input:  Registration date from documents
  Method: Compute age: currentDate - registrationDate
  Claim:  "Business has been operating for more than 6 months"
  Output: VERIFIED (age > 180 days) or FAILED
  Privacy: ZK proof generated so exact date is never revealed

CHECK 4: DOCUMENT COMPLETENESS
  Input:  Count of uploaded document types
  Method: Check all 5 required documents present
  Claim:  "All required documents have been submitted (X/5)"
  Output: VERIFIED (X=5) or FAILED (X<5)

CHECK 5: AI RISK ASSESSMENT
  Input:  All business data (existing Gemini AI call)
  Method: Call Gemini AI for risk analysis (existing service)
  Claim:  "AI risk assessment: [score]/100 (Low/Medium/High risk)"
  Output: Always VERIFIED (the score itself is the information)
  Note:   AI score is not private — shown directly to voters

CHECK 6: FUNDING GOAL REASONABILITY
  Input:  fundingGoal, category, location
  Method: Compare with predefined category averages
  Claim:  "Funding goal is within normal range for this category"
          or "Funding goal is above average for this category"
  Output: VERIFIED or WARNING (not FAILED — just a flag)
```

### Step 3.2 — Write verificationOracle.service.js

**File:** `backend/src/services/verificationOracle.service.js`

**Main function: `startVerification(businessId)`**

Sub-steps:
1. Load business from database
2. Update `business.attestationStatus = 'in_progress'`
3. Run all 6 checks in sequence (or parallel for independent checks)
4. For each check:
   a. Compute result (VERIFIED/FAILED)
   b. Compute proofHash: SHA-256 of (businessId + claim + result + timestamp)
   c. Call `documentRegistry.addAttestation()` on-chain
   d. Wait for tx confirmation
   e. Store tx hash in `business.attestationTxHashes` array
5. After all 6 checks complete:
   - Update `business.attestationStatus = 'complete'`
   - Call `proposalCreator.service.js` to create governance proposal
6. If any check errors:
   - Update `business.attestationStatus = 'failed'`
   - Log error for admin review (admin can re-trigger manually)

**Helper function: `verifyGST(gstNumber)`**
- Returns `{ valid: boolean, errorMessage: string }`
- For hackathon: validate GST format (15-character alphanumeric)

**Helper function: `verifyPAN(panNumber)`**
- Returns `{ valid: boolean }`
- For hackathon: validate PAN format (XXXXX9999X pattern)

**Helper function: `checkBusinessAge(registrationDate)`**
- Returns `{ meetsMinimum: boolean, ageInDays: number }`
- Also triggers ZK proof generation for age

**Helper function: `checkFundingGoalReason(goal, category)`**
- Category averages map (hardcoded for hackathon):
  ```
  {
    food_beverage: { avg: 200000, max: 1000000 },
    retail: { avg: 300000, max: 2000000 },
    services: { avg: 150000, max: 800000 },
    ...
  }
  ```

### Step 3.3 — Get Attestations Endpoint (Backend)

**File:** `backend/src/controllers/governance.controller.js`

**Endpoint: `GET /api/governance/business/:id/attestations`**

Sub-steps:
1. Get business from MongoDB (to get businessId string)
2. Call `documentRegistry.getAttestations(businessId)` on-chain
3. Call `documentRegistry.getRangeProofs(businessId)` on-chain
4. Call `documentRegistry.getVerificationSummary(businessId)` on-chain
5. Return combined response:
   ```json
   {
     "businessId": "abc123",
     "totalClaims": 6,
     "verifiedClaims": 5,
     "failedClaims": 1,
     "attestations": [
       {
         "claim": "GST registration is valid and active",
         "status": "VERIFIED",
         "verifier": "0xOracle...",
         "method": "api_oracle",
         "verifiedAt": "2026-03-04T10:30:00Z",
         "txHash": "0xabc...",
         "celoScanUrl": "https://celo-sepolia.blockscout.com/tx/0xabc..."
       }
     ],
     "rangeProofs": [
       {
         "claim": "Monthly revenue > ₹30,000",
         "isAboveThreshold": true,
         "verifiedAt": "...",
         "txHash": "..."
       }
     ]
   }
   ```

### Step 3.4 — AttestationBadges Component (Frontend)

**File:** `frontend/src/components/governance/AttestationBadges.jsx`

**Displays for each attestation:**
```
✅ GST Registration: Valid and active       [View Tx ↗]
✅ PAN Number: Matches owner identity       [View Tx ↗]
✅ Business Age: > 6 months (ZK verified)  [View Tx ↗]
✅ Documents: All 5/5 submitted            [View Tx ↗]
🤖 AI Risk Score: 72/100 (Medium Risk)     [View Tx ↗]
⚠️ Funding Goal: Above category average   [View Tx ↗]

Summary: 5/6 verified ● 1 warning ● 0 failed
```

**Color coding:**
- Green badge (✅): VERIFIED
- Yellow badge (⚠️): WARNING
- Red badge (❌): FAILED
- Blue badge (🤖): AI-generated (always shown)

---

## 8. Phase 4 — Zero-Knowledge Proof System

### Overview
ZK proofs allow the system to prove mathematical facts about private data WITHOUT revealing the data. For example: prove revenue is above a threshold without revealing the exact revenue.

### What is a ZK Proof (Simple Explanation)

```
WITHOUT ZK:   "Our revenue this month was ₹85,234"
              → Voter sees exact revenue — privacy violated

WITH ZK Proof:
  Public input:  threshold = ₹30,000
  Private input: actual = ₹85,234 (NEVER revealed)
  Proof output:  "actual > threshold" = TRUE
  
  Voter sees:    "Revenue is above ₹30,000" ✅ (ZK verified)
  Voter does NOT see: ₹85,234
```

### Step 4.1 — Install ZK Libraries

**In smart-contracts directory:**
```bash
npm install --save-dev snarkjs
npm install --save-dev circom
```

**In backend directory:**
```bash
npm install snarkjs
```

### Step 4.2 — Create Revenue Range Circuit

**File:** `smart-contracts/circuits/revenueRange.circom`

**What this circuit proves:**
- "A private value is greater than a public threshold"
- Used for: monthly revenue verification

**Inputs:**
```
Private (hidden from everyone except prover):
  signal private input actualRevenue;  // e.g., 85234

Public (visible to everyone):
  signal input threshold;              // e.g., 30000

Output (public):
  signal output isAbove;               // 1 if above, 0 if not
```

**Circuit logic (in pseudocode):**
```
Check: actualRevenue > threshold
Output: 1 (true) or 0 (false)
Also prove: actualRevenue > 0 (no negative revenue fraud)
Also prove: actualRevenue < 100000000 (reasonable upper bound)
```

### Step 4.3 — Create Business Age Circuit

**File:** `smart-contracts/circuits/businessAge.circom`

**What this circuit proves:**
- "A business registration date is before a minimum age threshold"
- Used for: verifying business is established (>6 months old)

**Inputs:**
```
Private:
  signal private input registrationTimestamp;  // Unix timestamp

Public:
  signal input currentTimestamp;               // current block time
  signal input minimumAgeSeconds;             // 6 months = 15552000

Output:
  signal output meetsMinimum;                  // 1 if old enough
```

### Step 4.4 — Compile Circuits and Generate Verification Keys

**Steps (run once during setup):**

1. **Compile circuits:**
   ```bash
   cd smart-contracts
   circom circuits/revenueRange.circom --r1cs --wasm --sym -o build/
   circom circuits/businessAge.circom --r1cs --wasm --sym -o build/
   ```

2. **Powers of Tau ceremony (trusted setup):**
   ```bash
   snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
   snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="InvestX"
   snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
   ```

3. **Generate zkey for each circuit:**
   ```bash
   snarkjs groth16 setup build/revenueRange.r1cs pot12_final.ptau revenueRange_0.zkey
   snarkjs zkey contribute revenueRange_0.zkey revenueRange_final.zkey --name="InvestX"
   snarkjs zkey export verificationkey revenueRange_final.zkey revenueRange_vkey.json
   ```

4. **Export Solidity verifier contract:**
   ```bash
   snarkjs zkey export solidityverifier revenueRange_final.zkey ZKRevenueVerifier.sol
   ```
   → This auto-generates the `ZKRevenueVerifier.sol` contract

5. Repeat steps 3-4 for businessAge circuit

### Step 4.5 — Write zkProof.service.js (Backend)

**File:** `backend/src/services/zkProof.service.js`

**Function: `generateRevenueRangeProof(actualRevenue, threshold)`**
- Sub-steps:
  1. Prepare inputs object:
     ```javascript
     { actualRevenue: actualRevenue.toString(), threshold: threshold.toString() }
     ```
  2. Load the wasm file: `build/revenueRange_js/revenueRange.wasm`
  3. Load the zkey file: `revenueRange_final.zkey`
  4. Call `snarkjs.groth16.fullProve(inputs, wasmFile, zkeyFile)`
  5. Returns `{ proof, publicSignals }` where `publicSignals[0]` = 1 (above) or 0 (below)
  6. Serialize proof to JSON string
  7. Compute proofHash: SHA-256 of serialized proof
  8. Return `{ isAboveThreshold: publicSignals[0] === '1', proofHash, proof, publicSignals }`

**Function: `generateBusinessAgeProof(registrationTimestamp, minimumAgeSeconds)`**
- Same pattern as revenue proof but for age circuit

**Function: `verifyProofOnChain(businessId, claim, isAbove, proofHash)`**
- Calls `documentRegistry.addRangeProof()` on-chain
- Returns tx hash

### Step 4.6 — ZKProofBadge Component (Frontend)

**File:** `frontend/src/components/governance/ZKProofBadge.jsx`

**Displays:**
```
🔒 Monthly Revenue > ₹30,000             TRUE ✅  [Verify Proof ↗]
🔒 Business Age > 6 months               TRUE ✅  [Verify Proof ↗]

ℹ️ These are zero-knowledge proofs. The exact values are 
   private. Only the range claims are proven and verifiable.
```

**"Verify Proof" link:**
- Links to CeloScan tx where the ZK proof was verified on-chain
- Anyone can call the verifier contract with the proof to check it themselves

---

## 9. Phase 5 — Governance Contract & Voting

### Step 5.1 — Write InvestXGovernance.sol

**Location:** `smart-contracts/contracts/InvestXGovernance.sol`

**Contract configuration constants:**
```solidity
uint256 public constant MIN_VOTERS = 3;
uint256 public constant APPROVAL_PERCENT = 60;
uint256 public constant EMERGENCY_APPROVAL = 80;
uint256 public constant EMERGENCY_MIN_VOTERS = 5;
uint256 public constant VOTING_DURATION = 2 days;
uint256 public constant MAX_VOTE_WEIGHT_PERCENT = 20;
uint256 public constant MIN_INVX_TO_VOTE = 1 ether;
```

**Enums:**
```solidity
enum ProposalType {
  BUSINESS_APPROVAL,      // approve/reject a new business
  REVENUE_VERIFICATION,   // verify monthly revenue report
  EMERGENCY_DELIST        // emergency: remove business + refund
}

enum ProposalStatus {
  ACTIVE,
  PASSED,
  REJECTED,
  EXECUTED
}
```

**Proposal struct:**
```solidity
struct Proposal {
  uint256         id
  ProposalType    proposalType
  ProposalStatus  status
  string          businessId        // MongoDB ID
  string          metadata          // IPFS hash with full details
  address         proposer
  uint256         upvoteWeight      // sum of weighted votes FOR
  uint256         downvoteWeight    // sum of weighted votes AGAINST
  uint256         voterCount        // unique voters (not weight)
  uint256         startTime
  uint256         endTime
  bool            executed
}
```

**State variables:**
```solidity
IERC20 public invxToken
uint256 public proposalCount
mapping(uint256 => Proposal) public proposals
mapping(uint256 => mapping(address => bool)) public hasVoted
mapping(uint256 => mapping(address => bool)) public voteDirection
```

**Functions:**

```
createProposal(type, businessId, metadata) → proposalId
  - Requires: invxToken.balanceOf(msg.sender) >= MIN_INVX_TO_VOTE
  - Creates proposal with endTime = now + VOTING_DURATION
  - emit ProposalCreated(id, type, businessId)

vote(proposalId, support) 
  - Requires: proposal is ACTIVE, not voted yet, enough INVX
  - Calculates weight: min(balance, totalSupply * MAX_VOTE_WEIGHT_PERCENT / 100)
  - Records vote direction and weight
  - Increments voterCount
  - emit Voted(proposalId, voter, support, weight)

finalizeProposal(proposalId)
  - Can be called by ANYONE after endTime
  - Checks voterCount >= MIN_VOTERS (or EMERGENCY_MIN_VOTERS)
  - Checks upvote percentage >= threshold
  - Sets status to PASSED or REJECTED
  - emit ProposalFinalized(id, status)

getProposal(id) → Proposal
getVotingPower(voter) → uint256
hasUserVoted(proposalId, voter) → bool
getVoteResult(proposalId) → (upvotes, downvotes, voters, status)
```

**Vote weight calculation:**
```
maxWeightForUser = totalINVXSupply × MAX_VOTE_WEIGHT_PERCENT / 100
effectiveWeight = min(userINVXBalance, maxWeightForUser)
```

**Finalization logic:**
```
if voterCount < minRequiredVoters:
  → REJECTED (insufficient participation)
else:
  totalWeight = upvoteWeight + downvoteWeight
  upvotePercent = (upvoteWeight × 100) / totalWeight
  
  if upvotePercent >= requiredApprovalPercent:
    → PASSED
  else:
    → REJECTED
```

### Step 5.2 — Deploy Governance Contract

**Add to `deployGovernance.js` script:**
1. Deploy `InvestXGovernance` with `INVXToken.address` as constructor argument
2. Save address to `deployed-governance.json`
3. Update `backend/src/config/governance.js` with the new address

### Step 5.3 — Create Proposal Model (MongoDB)

**File:** `backend/src/models/Proposal.js`

**Fields:**
```javascript
proposalId:     Number (on-chain ID)
businessId:     ObjectId (ref: Business)
proposalType:   String enum ['business_approval', 'revenue_verification', 'emergency_delist']
status:         String enum ['active', 'passed', 'rejected', 'executed', 'pending_creation']
metadataIpfs:   String (IPFS CID of proposal details)
onChainTxHash:  String (createProposal tx hash)
finalizeTxHash: String (finalizeProposal tx hash)
votingEndsAt:   Date
createdAt:      Date
finalizedAt:    Date
totalVoters:    Number
upvotePercent:  Number (stored after finalization)
```

### Step 5.4 — Create Vote Model (MongoDB)

**File:** `backend/src/models/Vote.js`

**Fields:**
```javascript
proposalId:     Number (on-chain ID)
proposalDbId:   ObjectId (ref: Proposal)
userId:         ObjectId (ref: User)
walletAddress:  String
support:        Boolean (true = upvote, false = downvote)
voteWeight:     String (INVX wei amount)
txHash:         String (on-chain vote tx)
isCorrect:      Boolean (filled after finalization)
invxRewarded:   Boolean (whether +3 INVX bonus was given)
createdAt:      Date
```

### Step 5.5 — Governance Routes (Backend)

**File:** `backend/src/routes/governance.routes.js`

**Routes:**
```
GET    /api/governance/proposals                   → list all proposals
GET    /api/governance/proposals/active            → active proposals only
GET    /api/governance/proposals/:id               → proposal details
POST   /api/governance/proposals/:id/vote          → submit vote
POST   /api/governance/proposals/:id/finalize      → trigger finalization
GET    /api/governance/proposals/:id/result        → get final result
GET    /api/governance/my-votes                    → current user's votes
GET    /api/governance/my-invx                     → INVX balance + power
GET    /api/governance/business/:id/attestations   → ZK claims for business
GET    /api/governance/leaderboard                 → voter rankings
GET    /api/governance/stats                       → platform governance stats
```

**Authentication:**
- `GET /proposals`, `GET /stats`, `GET /business/:id/attestations` → Public (no auth required)
- `POST /vote`, `GET /my-votes`, `GET /my-invx` → Requires auth token

### Step 5.6 — Governance Controller Functions

**File:** `backend/src/controllers/governance.controller.js`

**`getProposals(req, res)`**
1. Fetch from MongoDB Proposal collection
2. Enrich each with: business name, category, attestation summary
3. If proposal is still active, also fetch live vote counts from on-chain
4. Return paginated list

**`getProposalById(req, res)`**
1. Fetch proposal from MongoDB
2. Fetch full details from on-chain: `governance.getProposal(id)`
3. Fetch attestations: `documentRegistry.getAttestations(businessId)`
4. Fetch range proofs: `documentRegistry.getRangeProofs(businessId)`
5. Fetch business details from MongoDB (name, category, AI score, etc.)
6. If user is logged in: check if they've voted (`governance.hasUserVoted`)
7. Return enriched response

**`vote(req, res)`**
1. Get user's wallet address from auth token
2. Verify user has INVX: `invxToken.balanceOf(walletAddress) >= MIN_INVX`
3. Check user hasn't voted on this proposal: `governance.hasUserVoted(id, wallet)`
4. Build and sign the `vote()` transaction (backend wallet signs, user's wallet is the voter)
   - Note: For true decentralization, the frontend should send the tx directly from user's wallet via MetaMask, not through the backend wallet
5. Wait for tx confirmation
6. Record vote in MongoDB Vote collection
7. Reward user: `invxReward.rewardUser(userId, 'VOTE_PARTICIPATION', voteActionId)`
8. Return tx hash

**`finalizeProposal(req, res)`**
1. Check proposal endTime has passed
2. Call `governance.finalizeProposal(proposalId)` on-chain
3. Wait for tx confirmation, get result (PASSED/REJECTED)
4. Update Proposal in MongoDB with final status
5. If PASSED:
   - Call business approval flow (see Step 10.1)
6. Determine correct voters (those who voted with majority)
7. Reward each correct voter: `invxReward.rewardUser(userId, 'VOTE_CORRECT', actionId)`
8. Update Vote records: `isCorrect = true/false`
9. Send notifications to all voters
10. Return finalization tx hash

### Step 5.7 — Add Governance Tab to Frontend Navbar

**File:** `frontend/src/App.js`

**Add route:**
```
/governance                → GovernancePage.jsx
/governance/proposals/:id  → ProposalDetailPage.jsx
/governance/my-votes       → MyVotesPage.jsx
/governance/analytics      → GovernanceAnalyticsPage.jsx
/verify/:businessId        → DocumentVerificationPage.jsx
```

**Update Navbar:**
- Add "Governance" link in navbar (for all users)
- Show INVX balance badge when wallet connected

### Step 5.8 — GovernancePage.jsx

**File:** `frontend/src/pages/governance/GovernancePage.jsx`

**Three tabs:**

**Tab 1: Active Proposals**
```
For each active proposal, show a ProposalCard with:
├── Business name + photo
├── Proposal type (Business Approval / Revenue Verification)
├── Time remaining countdown
├── Attestation summary: "5/6 verified claims"
├── ZK proof summary: "2 range proofs verified"
├── Current voter count vs quorum needed
├── User's INVX balance and voting power
└── "Vote Now" button → ProposalDetailPage
```

**Tab 2: My Votes**
```
For each past vote:
├── Business name
├── Proposal type and date
├── Your vote: 👍 or 👎
├── Outcome: PASSED / REJECTED
├── Was your vote correct? ✅ or ❌
└── INVX earned: +2 (participation) + 3 (correct)
```

**Tab 3: Recent Results**
```
For each completed proposal:
├── Business name
├── Final result: PASSED ✅ or REJECTED ❌
├── Vote breakdown: X% upvotes, Y% downvotes, Z voters
└── CeloScan link to finalization tx
```

### Step 5.9 — ProposalDetailPage.jsx

**File:** `frontend/src/pages/governance/ProposalDetailPage.jsx`

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  [BUSINESS PHOTO]                                           │
│                                                             │
│  📋 Chai Corner — Business Approval Vote                   │
│  Category: Food & Beverage | Kolkata, West Bengal          │
│  Funding Goal: ₹50,000 | Revenue Share: 15%               │
│  AI Risk Score: 72/100 (Medium Risk)                       │
│                                                             │
│  ── Verified Claims ──────────────────────────────────────  │
│  [AttestationBadges component here]                         │
│                                                             │
│  ── ZK Range Proofs ──────────────────────────────────────  │
│  [ZKProofBadge component here]                              │
│                                                             │
│  ── Current Vote Status ──────────────────────────────────  │
│  Voters so far: 4        Quorum needed: 3 ✅               │
│  Time remaining: 1 day 6 hours 23 minutes                   │
│  (Vote counts hidden until voting period ends)              │
│                                                             │
│  ── Your Voting Power ────────────────────────────────────  │
│  INVX Balance: 25 INVX                                      │
│  Effective Weight: 15.5% of total supply                    │
│  Action: Voting will earn you 2 INVX                        │
│                                                             │
│  [IF NOT VOTED:]                                            │
│  ┌────────────────┐     ┌─────────────────────┐            │
│  │  👍 UPVOTE     │     │  👎 DOWNVOTE         │            │
│  │  (Approve)     │     │  (Reject)            │            │
│  └────────────────┘     └─────────────────────┘            │
│                                                             │
│  [IF VOTED:]                                                │
│  ✅ You voted: UPVOTE (Approve)                             │
│  Tx: 0xabc...def [View on CeloScan ↗]                     │
│                                                             │
│  ── Document Integrity ───────────────────────────────────  │
│  5/5 document hashes verified on-chain                      │
│  [View Document Verification Page ↗]                        │
└────────────────────────────────────────────────────────────┘
```

**Vote submission flow (frontend):**
1. User clicks "UPVOTE" or "DOWNVOTE"
2. Show confirmation modal: "You are voting to APPROVE Chai Corner. This is final and recorded on-chain."
3. Trigger wallet transaction via MetaMask (call `governance.vote()` directly from user's wallet)
4. Show "Confirm in MetaMask" spinner
5. Wait for tx confirmation
6. Show: "Vote submitted! ✅ You earned 2 INVX. Tx: 0xabc..."
7. Reload vote status

---

## 10. Phase 6 — Auto-Dividend Distributor Contract

### Overview
Instead of business paying to admin wallet (current system), they pay to a smart contract that holds the funds and auto-distributes after a successful revenue verification vote.

### Step 6.1 — Write DividendDistributor.sol

**Location:** `smart-contracts/contracts/DividendDistributor.sol`

**How it works:**
```
Business pays CELO → DividendDistributor contract (locked)
Community votes on revenue report → 2 days
If PASSED → Contract automatically pays each investor
           proportional to their token holdings
If REJECTED → Funds remain locked
             Business must resubmit
```

**State variables to define:**
```solidity
mapping(bytes32 => uint256) public lockedFunds
   → businessHash → CELO amount locked for next distribution

mapping(bytes32 => bool) public distributionApproved
   → businessHash → whether current month's distribution is approved

mapping(bytes32 => address[]) public investors
   → businessHash → list of investor addresses to pay

mapping(bytes32 => mapping(address => uint256)) public investorShares
   → businessHash → investor → their share percentage (basis points, /10000)

address public governanceContract    // only governance can approve
```

**Functions:**

```
depositDividend(businessId) payable
  - Business owner calls this, sends CELO
  - Locks CELO for that business
  - emit DividendDeposited(businessId, amount)

distributionApproved(businessId, investorAddresses[], shares[])
  - onlyGovernance (called by governance contract after vote passes)
  - Marks distribution as approved
  - Stores investor list and shares (from current token holdings)
  - Triggers distribution

_distribute(businessId)
  - Internal: loops through investors, sends proportional CELO
  - Based on investorShares mapping
  - emit DividendDistributed(businessId, totalAmount)

rejectDistribution(businessId)
  - onlyGovernance (called when vote fails)
  - Keeps funds locked pending resubmission
  - emit DistributionRejected(businessId)

getLockedFunds(businessId) → uint256
```

**Investor share calculation:**
```
Each investor's share = (their tokens / total tokens sold) × 100%
Stored as basis points: e.g., 15.5% = 1550 basis points
Distribution: investor receives (lockedFunds × investorShare) / 10000
```

### Step 6.2 — Update Revenue Report Submission (Backend)

**File:** `backend/src/controllers/business.controller.js`
**Function:** `submitRevenueReport`

**Updated flow:**
1. Business enters revenue amount (private)
2. Backend generates ZK range proof (Step 4.5)
3. Backend stores ZK proof on-chain via DocumentRegistry
4. Backend calculates dividend amount: `revenue × revenueSharePct% / CELO_INR_RATE`
5. Frontend shows: "Pay X.XX CELO to DividendDistributor contract to proceed"
6. Business owner sends CELO to DividendDistributor contract address (MetaMask transaction)
7. Business provides txHash of payment
8. Backend verifies tx is to DividendDistributor contract for correct amount
9. Backend auto-creates REVENUE_VERIFICATION governance proposal
10. Status stored: 'pending_vote' (dividend held in contract until vote)

### Step 6.3 — After Vote Passes: Auto-Distribute

**In `proposalFinalizer.service.js` (when proposal type is REVENUE_VERIFICATION and status is PASSED):**
1. Fetch all investors for this business from MongoDB
2. Fetch each investor's token holdings from BusinessToken contract
3. Calculate each investor's share (basis points)
4. Call `dividendDistributor.distributionApproved(businessId, investorAddresses, shares)`
5. Contract automatically distributes CELO to all investors
6. Wait for tx confirmation
7. Update DividendRecord in MongoDB with distribution tx hash
8. Reward each investor with 3 INVX (dividend received reward)
9. Send notifications to all investors

---

## 11. Phase 7 — Backend: Governance APIs

### Step 7.1 — Register Routes

**File:** `backend/server.js`

**Add:**
```javascript
const governanceRoutes = require('./src/routes/governance.routes');
app.use('/api/governance', governanceRoutes);
```

### Step 7.2 — Full Route-to-Controller Mapping

| Route | Controller Function | Auth | Description |
|---|---|---|---|
| GET /proposals | `getProposals` | Public | List all proposals |
| GET /proposals/active | `getActiveProposals` | Public | Only ACTIVE ones |
| GET /proposals/:id | `getProposalById` | Public | Full proposal details |
| POST /proposals/:id/vote | `submitVote` | Required | Submit vote |
| POST /proposals/:id/finalize | `finalizeProposal` | Required | Finalize after voting |
| GET /proposals/:id/result | `getProposalResult` | Public | Final tally |
| GET /my-votes | `getMyVotes` | Required | User's vote history |
| GET /my-invx | `getMyINVX` | Required | Balance + power |
| GET /business/:id/attestations | `getAttestations` | Public | ZK claims |
| GET /leaderboard | `getLeaderboard` | Public | Voter rankings |
| GET /stats | `getGovernanceStats` | Public | Platform stats |

### Step 7.3 — Update Existing Business Application Flow

**File:** `backend/src/controllers/business.controller.js`

**In `submitApplication`:**
1. After saving business to MongoDB
2. After uploading documents to Cloudinary
3. **NEW:** Hash each document
4. **NEW:** Register hashes on DocumentRegistry contract
5. **NEW:** Trigger oracle service (async)
6. Return success (oracle runs in background)
7. Business status stays 'pending' → 'verifying' → (after oracle) 'ready_for_vote'

**Update business status enum in Business model:**
```
'pending'          → submitted, not yet verified
'verifying'        → oracle is running verification checks
'vote_required'    → attestations done, awaiting governance proposal creation
'voting'           → governance proposal active, voting in progress
'approved'         → vote passed, token being deployed
'fundraising'      → token deployed, accepting investments
'funded'           → goal reached, funds released
'active'           → operating, accepting revenue reports
'rejected'         → community voted to reject (was: admin rejected)
'completed'        → campaign ended
```

---

## 12. Phase 8 — Backend: Oracle & Cron Services

### Step 8.1 — proposalCreator.service.js

**File:** `backend/src/services/proposalCreator.service.js`

**Triggered by:** Oracle service after all attestations complete

**Function: `createBusinessProposal(businessId)`**
1. Load business from MongoDB
2. Build metadata object:
   ```json
   {
     "businessId": "...",
     "name": "Chai Corner",
     "category": "food_beverage",
     "fundingGoal": 50000,
     "revenueSharePercentage": 15,
     "aiCreditScore": 72,
     "riskRating": "MEDIUM",
     "location": { "city": "Kolkata", "state": "West Bengal" },
     "attestationSummary": { "total": 6, "verified": 5, "failed": 1 },
     "photoUrl": "https://..."
   }
   ```
3. Upload metadata to IPFS via Pinata
4. Call `governance.createProposal(BUSINESS_APPROVAL, businessId, ipfsCid)` on-chain
5. Wait for tx confirmation, get returned proposalId
6. Create Proposal record in MongoDB
7. Update Business: `business.proposalId = proposalId`, `status = 'voting'`
8. Trigger notifications to all INVX holders (Step 15)

### Step 8.2 — proposalFinalizer.service.js

**File:** `backend/src/services/proposalFinalizer.service.js`

**This is a cron job that runs every 30 minutes**

**Steps:**
1. Query MongoDB for proposals where `status = 'active'` AND `votingEndsAt < now`
2. For each expired proposal:
   a. Call `governance.finalizeProposal(proposalId)` on-chain
   b. Wait for tx confirmation
   c. Get result: PASSED or REJECTED
3. If PASSED and type is BUSINESS_APPROVAL:
   - Call `approveBusiness(businessId)` (existing logic — deploys token)
   - Update business status: 'voting' → 'approved' → 'fundraising'
   - Deploy BusinessToken contract
4. If REJECTED and type is BUSINESS_APPROVAL:
   - Update business status: 'voting' → 'rejected'
5. If PASSED and type is REVENUE_VERIFICATION:
   - Fetch investor list + token holdings
   - Call `dividendDistributor.distributionApproved(businessId, ...)`
6. If REJECTED and type is REVENUE_VERIFICATION:
   - Call `dividendDistributor.rejectDistribution(businessId)`
7. Identify correct voters (voted with majority)
8. For each correct voter: reward +3 INVX
9. Update all Vote records with `isCorrect` field
10. Update Proposal record with finalization data
11. Send notifications

**How to run cron:**
```javascript
// In server.js:
const cron = require('node-cron');
const finalizer = require('./src/services/proposalFinalizer.service');

cron.schedule('*/30 * * * *', () => {
  finalizer.checkAndFinalize();
});
```

### Step 8.3 — Register Cron Jobs in server.js

**All cron jobs to add:**
```javascript
// Every 30 minutes: finalize expired proposals
cron.schedule('*/30 * * * *', proposalFinalizer.checkAndFinalize);

// Every hour: check for businesses with complete attestations needing proposals
cron.schedule('0 * * * *', proposalCreator.checkPendingBusinesses);

// Every hour: send voting reminders (12h before deadline)
cron.schedule('0 * * * *', notificationService.sendVoteReminders);
```

---

## 13. Phase 9 — Frontend: Governance Pages

### Step 9.1 — governance.api.js

**File:** `frontend/src/services/governance.api.js`

**Functions to implement:**
```javascript
getProposals(filters)       → GET /api/governance/proposals
getActiveProposals()        → GET /api/governance/proposals/active
getProposalById(id)         → GET /api/governance/proposals/:id
submitVote(id, support)     → POST /api/governance/proposals/:id/vote
                               Body: { support: true/false, txHash }
finalizeProposal(id)        → POST /api/governance/proposals/:id/finalize
getMyVotes()                → GET /api/governance/my-votes
getMyINVX()                 → GET /api/governance/my-invx
getAttestations(businessId) → GET /api/governance/business/:id/attestations
getLeaderboard()            → GET /api/governance/leaderboard
getGovernanceStats()        → GET /api/governance/stats
```

### Step 9.2 — GovernancePage.jsx Structure

```
GovernancePage.jsx
├── Header: "InvestX Governance"
│   └── Subtitle: "Community-powered business approval"
├── Stats Bar (pulls from /api/governance/stats):
│   ├── Active Proposals: X
│   ├── Your INVX: X tokens
│   ├── Your Voting Power: X%
│   └── Total Voters: X/10 active
├── Tabs: [Active Votes] [My Votes] [Results]
├── Tab: Active Votes
│   └── Map over active proposals → <ProposalCard />
├── Tab: My Votes
│   └── Map over user's votes → vote history cards
└── Tab: Results
    └── Map over completed proposals → result cards
```

### Step 9.3 — ProposalCard.jsx Props and Display

**Props:** `{ proposal, userVotingPower, hasVoted }`

**Displays:**
- Business name + photo thumbnail
- Proposal type badge (green: Business Approval, blue: Revenue Verification)
- Attestation score: "5/6 verified"
- Quorum indicator: "4/3 voters ✅" or "2/3 voters ⏳"
- Time remaining countdown
- CTA: "Vote Now" (if not voted) or "Voted ✅" (if voted)

### Step 9.4 — VotingPanel.jsx

**File:** `frontend/src/components/governance/VotingPanel.jsx`

**Handles the entire vote submission flow:**

1. Show user's INVX balance and effective voting power
2. Show two buttons: 👍 APPROVE and 👎 REJECT
3. On click → show confirmation modal
4. On confirm → call MetaMask to sign governance.vote() transaction
5. Poll for tx confirmation
6. On success → show INVX reward animation (+2 INVX earned)
7. Reload proposal data

**Important:** Votes are submitted DIRECTLY from user's wallet via MetaMask for true decentralization. The backend does NOT sign votes — only the user can cast their own vote.

### Step 9.5 — Update App.js Routes

```javascript
import GovernancePage from './pages/governance/GovernancePage';
import ProposalDetailPage from './pages/governance/ProposalDetailPage';
import MyVotesPage from './pages/governance/MyVotesPage';
import GovernanceAnalyticsPage from './pages/governance/GovernanceAnalyticsPage';

// Add inside <Routes>:
<Route path="/governance" element={<GovernancePage />} />
<Route path="/governance/proposals/:id" element={<ProposalDetailPage />} />
<Route path="/governance/my-votes" element={<MyVotesPage />} />
<Route path="/governance/analytics" element={<GovernanceAnalyticsPage />} />
<Route path="/verify/:businessId" element={<DocumentVerificationPage />} />
```

---

## 14. Phase 10 — Remove Admin Control

### Step 10.1 — Disable Admin Business Approval

**File:** `backend/src/routes/admin.routes.js`

**Remove or comment out:**
```javascript
// router.post('/businesses/:id/approve', adminOnly, approveBusiness);
// router.post('/businesses/:id/reject', adminOnly, rejectBusiness);
```

**Why:** Business approval now happens automatically via `proposalFinalizer.service.js` after vote passes.

### Step 10.2 — Disable Admin Revenue Verification

**File:** `backend/src/routes/admin.routes.js`

**Remove or comment out:**
```javascript
// router.post('/revenue/:id/verify', adminOnly, verifyRevenueReport);
```

**Why:** Revenue verification now done by community vote. Dividends auto-distributed by DividendDistributor contract.

### Step 10.3 — Update Admin Dashboard

**File:** `frontend/src/pages/admin/AdminDashboard.jsx`

**Remove:**
- "Pending Approvals" section (no longer relevant)
- "Approve Business" and "Reject Business" buttons from business list
- "Verify Revenue" button from revenue reports section

**Add:**
- "Governance Overview" section showing all active proposals
- "System Health" section:
  - Contract balances (admin wallet CELO, DividendDistributor contract balance)
  - Pending oracle verifications
  - Failed cron jobs
  - Total INVX distributed
- "Platform Statistics" (read-only numbers)
- Link to GovernanceAnalyticsPage

**What admin CAN still do:**
1. Re-trigger failed oracle verifications
2. View all platform data for monitoring
3. Manage contract upgrade (behind timelock in future)
4. Handle support tickets from users
5. Emergency pause (if Escrow contract has pause function)

### Step 10.4 — Update Business Detail Page

**File:** `frontend/src/pages/public/BusinessDetailPage.jsx`

**Remove:** Any UI that suggested admin approval

**Add:**
- "Governance" section near top showing proposal status:
  - If in voting: "Community Vote Active — X days remaining"
  - If approved: "✅ Approved by community vote on [date]"
  - If rejected: "❌ Not approved by community"
  - Link to proposal page

---

## 15. Phase 11 — Notification System

### Step 15.1 — Notification Model

**File:** `backend/src/models/Notification.js`

**Fields:**
```javascript
userId:     ObjectId (ref: User)
type:       String enum [
              'new_proposal',        // new business to vote on
              'vote_reminder',       // 12h before deadline, you haven't voted
              'proposal_passed',     // vote you participated in passed
              'proposal_rejected',   // vote you participated in rejected
              'vote_correct',        // your vote was correct +3 INVX
              'invx_earned',         // any INVX reward
              'dividend_received',   // you received a dividend
              'business_approved',   // your business was approved
              'business_rejected',   // your business was rejected
            ]
title:      String
message:    String
link:       String (frontend route)
read:       Boolean (default: false)
createdAt:  Date
```

### Step 15.2 — notification.service.js

**File:** `backend/src/services/notification.service.js`

**Function: `notifyUsersAboutNewProposal(proposal, business)`**
- Get all users who have INVX balance > 0
- For each user: create Notification record in MongoDB
- (Optional: send email via email.service.js)

**Function: `sendVoteReminders()`**
- Find proposals with endTime in next 12 hours
- Find INVX holders who haven't voted on these proposals
- Create 'vote_reminder' notification for each

**Function: `notifyVoters(proposalId, passed)`**
- Find all Vote records for this proposalId
- For each voter: create notification with result + INVX earned

**Function: `notifyBusinessOwner(businessId, passed, message)`**
- Find business owner user
- Create 'business_approved' or 'business_rejected' notification

### Step 15.3 — Notification Routes (Backend)

**Add to `user.routes.js`:**
```
GET   /api/users/me/notifications        → get my notifications (paginated)
PUT   /api/users/me/notifications/:id    → mark one as read
PUT   /api/users/me/notifications/read-all → mark all as read
GET   /api/users/me/notifications/count  → get unread count
```

### Step 15.4 — NotificationBell.jsx (Frontend)

**File:** `frontend/src/components/governance/NotificationBell.jsx`

**Behavior:**
- Polls `/api/users/me/notifications/count` every 60 seconds
- Shows red badge with unread count on bell icon in navbar
- Click to open dropdown with last 5 notifications
- "Mark all read" button
- "View all" link → `/notifications` page

**Notification items in dropdown:**
```
🗳️  New vote: Chai Corner needs approval   — 2h ago
⚡  You earned 3 INVX (correct vote)       — 1d ago
💰  Dividend received: 0.25 CELO           — 3d ago
✅  Puja's Kitchen was approved            — 5d ago
```

---

## 16. Phase 12 — Governance Analytics

### Step 16.1 — getGovernanceStats Controller Function

**Endpoint:** `GET /api/governance/stats`

**Returns:**
```json
{
  "platformStats": {
    "totalProposals": 15,
    "approvedBusinesses": 10,
    "rejectedBusinesses": 5,
    "averageVoterTurnout": 65,
    "activeVoters": 8,
    "totalINVXDistributed": "450.0",
    "totalVoteTransactions": 127
  },
  "currentProposals": {
    "active": 2,
    "awaitingFinalization": 1
  }
}
```

### Step 16.2 — getLeaderboard Controller Function

**Endpoint:** `GET /api/governance/leaderboard`

**Steps:**
1. Get all users who have voted at least once
2. For each: get their Vote records from MongoDB
3. Calculate accuracy: `correctVotes / totalVotes × 100`
4. Fetch INVX balance from on-chain
5. Sort by: INVX balance DESC (primary), accuracy DESC (secondary)
6. Return top 10 voters (anonymized: show only truncated wallet addresses)

**Returns:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "wallet": "0xAbcd...1234",
      "invxBalance": "48.0",
      "votingPower": "20%",
      "totalVotes": 12,
      "accuracy": 92,
      "isCurrentUser": false
    }
  ]
}
```

### Step 16.3 — GovernanceAnalyticsPage.jsx

**File:** `frontend/src/pages/governance/GovernanceAnalyticsPage.jsx`

**Sections:**
1. **Platform Health Card** — total proposals, approval rate, avg turnout, total INVX
2. **Voter Leaderboard Table** — top 10 voters by INVX + accuracy
3. **Proposal History** — table of all past proposals with results + CeloScan links
4. **Your Stats** (if logged in) — your votes, accuracy, INVX earned history

---

## 17. Testing Plan

### Step 17.1 — Smart Contract Tests

**File:** `smart-contracts/test/Governance.test.js`

**Test cases to write:**
```
INVXToken Tests:
1. Deploy token, verify name = "InvestX Governance Token", symbol = "INVX"
2. Non-minter cannot mint
3. Set minter, minter can mint to user
4. Transfer works correctly
5. Balances update after mint

RewardDistributor Tests:
6. Non-backend cannot call rewardUser
7. KYC reward mints 5 INVX
8. Same actionId cannot be rewarded twice
9. Owner can change reward amounts

DocumentRegistry Tests:
10. Non-verifier cannot register document
11. Register document, hash stored correctly
12. verifyDocumentIntegrity returns true for correct hash
13. verifyDocumentIntegrity returns false for wrong hash
14. Add attestation, retrieved correctly
15. Add range proof, retrieved correctly
16. Verification summary returns correct counts

InvestXGovernance Tests:
17. Cannot vote with 0 INVX
18. Create proposal, vote, finalize — PASSED
19. Create proposal, fewer than MIN_VOTERS → REJECTED
20. Create proposal, < 60% upvotes → REJECTED
21. Single voter capped at 20% weight
22. Cannot vote twice
23. Cannot vote after period ends
24. finalize before period ends → reverts
25. Emergency proposal needs 5 voters + 80%
```

### Step 17.2 — Backend Integration Tests

**File:** `backend/test/governance.test.js`

**Test cases:**
```
1. POST /api/governance/proposals/:id/vote — valid vote
2. POST /api/governance/proposals/:id/vote — no INVX → 400 error
3. POST /api/governance/proposals/:id/vote — duplicate vote → 400 error
4. GET /api/governance/business/:id/attestations — returns on-chain data
5. Cron: proposalFinalizer runs, picks up expired proposal
6. INVX reward service: reward issued only once per actionId
```

### Step 17.3 — End-to-End Test with 10 Users

**Setup:** Create 10 test wallets, give each 5-20 INVX via RewardDistributor

**Test flow:**
```
1. Submit business application with all documents
2. Verify oracle creates attestations on-chain
3. Verify governance proposal auto-created
4. Have 8 out of 10 users vote (5 upvote, 3 downvote)
5. Wait 2 days (or reduce VOTING_DURATION to 5 minutes for testing)
6. Call finalize
7. Verify: 8 voters > 3 quorum ✅, 62.5% > 60% threshold ✅ → PASSED
8. Verify: BusinessToken deployed
9. Verify: Correct voters received +3 INVX each
10. Have investor invest CELO
11. Submit revenue report
12. Verify ZK proof generated
13. Verify community vote created
14. Have voters verify
15. Verify: DividendDistributor auto-distributed
16. Verify: Investors received CELO
```

---

## 18. Deployment Sequence

### Order of Deployment (Important — Dependencies Matter)

```
Step 1: Deploy INVXToken.sol
        → No dependencies
        → Save address A1

Step 2: Deploy RewardDistributor.sol
        → Needs: INVXToken address (A1), backend wallet address
        → Save address A2
        → Call: INVXToken.setMinter(A2)

Step 3: Deploy DocumentRegistry.sol
        → No dependencies
        → Save address A3
        → Call: addVerifier(backendWalletAddress)

Step 4: Compile ZK circuits + generate keys
        → Run trusted setup (Powers of Tau)
        → Generate zkeys for revenueRange + businessAge

Step 5: Deploy ZKRevenueVerifier.sol (auto-generated by snarkjs)
        → Save address A4

Step 6: Deploy InvestXGovernance.sol
        → Needs: INVXToken address (A1)
        → Save address A5

Step 7: Deploy DividendDistributor.sol
        → Needs: InvestXGovernance address (A5)
        → Save address A6

Step 8: Update governance.js config with all addresses A1-A6

Step 9: Update backend .env:
        INVX_TOKEN_ADDRESS=...
        REWARD_DISTRIBUTOR_ADDRESS=...
        DOCUMENT_REGISTRY_ADDRESS=...
        ZK_VERIFIER_ADDRESS=...
        GOVERNANCE_ADDRESS=...
        DIVIDEND_DISTRIBUTOR_ADDRESS=...

Step 10: Deploy/redeploy backend with new services

Step 11: Rebuild frontend with new governance pages + routes

Step 12: Test full flow end-to-end
```

### All New Environment Variables Needed

```
# Add to backend/.env:
INVX_TOKEN_ADDRESS=0x...
REWARD_DISTRIBUTOR_ADDRESS=0x...
DOCUMENT_REGISTRY_ADDRESS=0x...
ZK_VERIFIER_ADDRESS=0x...
GOVERNANCE_ADDRESS=0x...
DIVIDEND_DISTRIBUTOR_ADDRESS=0x...

# ZK Circuit Files (paths relative to backend root)
ZK_REVENUE_WASM_PATH=../smart-contracts/build/revenueRange_js/revenueRange.wasm
ZK_REVENUE_ZKEY_PATH=../smart-contracts/build/revenueRange_final.zkey
ZK_AGE_WASM_PATH=../smart-contracts/build/businessAge_js/businessAge.wasm
ZK_AGE_ZKEY_PATH=../smart-contracts/build/businessAge_final.zkey
```

### npm Packages to Install

**smart-contracts:**
```bash
npm install --save-dev snarkjs circom
```

**backend:**
```bash
npm install snarkjs node-cron
```

**frontend:**
```bash
npm install (no new packages needed — all UI uses existing Tailwind + React)
```

---

## 19. How Investor + Voter Roles Work Together

### Business Lifecycle with Dual Role Users

```
USER = Investor + Voter (Same Person)

PHASE 1: APPLICATION SUBMITTED
State:  Business Status = 'verifying'
User:   Nothing to do yet, wait for oracle

PHASE 2: VOTING OPEN (2 days)
State:  Business Status = 'voting'
User:   CAN VOTE (if they have INVX)
User:   CANNOT INVEST yet
Earn:   +2 INVX for voting

PHASE 3: VOTE PASSED
State:  Business Status = 'fundraising'
User:   CAN NOW INVEST (buy tokens with CELO)
Earn:   +10 INVX for first investment
Earn:   +3 INVX if their vote was correct (voted with majority)

PHASE 4: FULLY FUNDED → ACTIVE
State:  Business Status = 'active'
User:   IS an investor (holds tokens)
User:   CAN VOTE on monthly revenue reports
Earn:   +3 INVX each time they vote on revenue
Earn:   +3 INVX if their vote was correct
Earn:   Dividend CELO each month (if revenue verified)
Earn:   +3 INVX for receiving dividend

PHASE 5: MONTHLY REVENUE CYCLE
State:  REVENUE_VERIFICATION proposal active
User:   Sees ZK proof: "Revenue > ₹30,000 TRUE"
User:   Votes to verify or dispute
Result: Dividends auto-distributed if vote passes
```

### Conflict of Interest Rules

```
RULE 1: Business owners CANNOT vote on their OWN business
        → Enforced by: backend middleware that checks
          if msg.sender === business.ownerWalletAddress
        → They can vote on ALL other businesses

RULE 2: Investors in a business CAN vote on future monthly 
        revenue reports for that business
        → Their incentive: they WANT correct revenue reports
          because it means they get dividends
        → This is not a conflict — it's alignment of interests

RULE 3: All votes are final and on-chain
        → Cannot change your vote
        → Cannot delete your vote
        → Everyone can verify your voting history

RULE 4: No anonymous voting in the final system
        → All votes linked to wallet addresses
        → Wallet addresses linked to real KYC identity (in admin view)
        → Voters know their voting pattern is publicly auditable
```

### INVX Earning Scenarios

```
Active User Journey (2 months):

Month 1:
Week 1: KYC verified          → +5 INVX  (total: 5)
Week 1: Invest in Business A  → +10 INVX (total: 15)
Week 2: Vote on Business B    → +2 INVX  (total: 17)
Week 2: Vote correct (B pass) → +3 INVX  (total: 20)
Week 3: Vote on Business C    → +2 INVX  (total: 22)
Week 3: Vote wrong (C pass)   → +0 INVX  (total: 22)
Week 4: Dividend from A       → +3 INVX  (total: 25)

Month 2:
Week 1: Vote on Business D    → +2 INVX  (total: 27)
Week 1: Vote correct (D pass) → +3 INVX  (total: 30)
Week 2: Invest in Business B  → +5 INVX  (total: 35)
Week 2: Vote on A revenue     → +2 INVX  (total: 37)
Week 2: Vote correct (A verif)→ +3 INVX  (total: 40)
Week 4: Dividend from A+B     → +6 INVX  (total: 46)

Voting Power: min(46, 20% of total supply)
```

---

## Summary: Key Design Principles

```
1. NO TRUST IN ANY SINGLE PARTY
   → Smart contracts enforce rules, not admins
   → Votes are immutable on-chain
   → Document proofs are cryptographic, not human-verified

2. PRIVACY WITH TRANSPARENCY
   → Documents: private (only hashes on-chain)
   → Claims: public (attestations visible to everyone)
   → Voter choices: public (wallet address + vote on-chain)
   → Revenue: public range (not exact amount, ZK proof)

3. INCENTIVE ALIGNMENT
   → Investors earn more INVX → more voting power
   → Voters who choose well earn more INVX
   → Bad voters lose relative influence over time
   → Everyone benefits from platform success

4. SYBIL RESISTANCE (anti-fake-account)
   → INVX only earned through real CELO investment
   → KYC verification required
   → Vote weight proportional to financial stake
   → Account age considered

5. GRACEFUL SCALING
   → Works with 10 users (3 voter quorum)
   → Same contracts work with 1000 users
   → Parameters adjustable by governance vote itself
```

---

*End of Implementation Guide*
*Total new smart contracts: 6 | Total new backend services: 6 | Total new frontend pages: 5*
