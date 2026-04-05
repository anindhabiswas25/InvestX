# InvestX — End-to-End Test Plan

> **Version:** 1.0  
> **Last Updated:** June 2025  
> **Purpose:** Verify the full decentralized business lifecycle from application to dividend distribution using 10 test wallets.

---

## Prerequisites

| Requirement | Details |
|---|---|
| Network | Celo Sepolia (Chain ID `11142220`) |
| RPC | `https://forno.celo-sepolia.celo-testnet.org` |
| Explorer | `https://celo-sepolia.blockscout.com` |
| Backend | Running at `http://localhost:5000` |
| Frontend | Running at `http://localhost:3000` |
| Contracts | All 6 governance contracts deployed (see `.env`) |
| Wallets | 10 MetaMask test wallets funded with testnet CELO |

---

## Test Wallets Setup

Create 10 wallets and distribute initial INVX tokens via `RewardDistributor`:

| Wallet | Label | Initial INVX | Role |
|---|---|---|---|
| W1 | Owner | 0 | Business owner (applies for listing) |
| W2 | Voter-A | 10 | Active voter |
| W3 | Voter-B | 15 | Active voter |
| W4 | Voter-C | 8 | Active voter |
| W5 | Voter-D | 20 | Active voter + investor |
| W6 | Voter-E | 5 | Active voter + investor |
| W7 | Voter-F | 12 | Active voter |
| W8 | Investor-A | 7 | Investor (will earn INVX via investment) |
| W9 | Investor-B | 5 | Investor |
| W10 | Observer | 0 | No INVX — expects rejection on vote attempt |

**Bootstrap INVX:** Run the `seedAdmin.js` script or call `RewardDistributor.rewardUser()` from the admin wallet for each test wallet using `actionId = "test_setup_Wx"`.

---

## E2E Test Flow (16 Steps)

### Step 1 — Submit Business Application

| Actor | W1 (Owner) |
|---|---|
| Action | `POST /api/businesses/apply` with documents (PAN, GST, photo, bank proof) |
| Expected | Business record created with `status: 'pending'` |
| Verify | MongoDB: Business document exists with uploaded Cloudinary URLs |

### Step 2 — Oracle Attestation Verification

| Actor | Backend (automatic via cron or manual trigger) |
|---|---|
| Action | `POST /api/governance/verify/:businessId` (admin-triggered) |
| Expected | Oracle service: validates docs → registers hashes on `DocumentRegistry` → creates attestations |
| Verify On-Chain | `DocumentRegistry.getDocumentDetails(hash)` returns valid entries |
| Verify On-Chain | `DocumentRegistry.getVerificationSummary(businessHash)` shows attestation count |

### Step 3 — Governance Proposal Auto-Created

| Actor | Backend (proposalCreator cron) |
|---|---|
| Expected | After >= 3 attestations, a governance `Proposal` is created in MongoDB |
| Expected | `Business.status` changed to `'voting'` |
| Verify | `GET /api/governance/proposals/active` returns the new proposal |
| Verify | All INVX holders (W2-W9) receive `'new_proposal'` notification |

### Step 4 — Voting Round (8 out of 10 voters)

| Actor | W2 through W9 (8 wallets) |
|---|---|
| Action | Each voter calls `InvestXGovernance.vote(proposalId, support)` via MetaMask |
| Votes | W2: ✅, W3: ✅, W4: ✅, W5: ✅, W6: ✅, W7: ❌, W8: ❌, W9: ❌ |
| Expected Result | 5 upvotes, 3 downvotes |
| INVX Earned | Each voter earns +2 INVX for participating |
| Verify | `GET /api/governance/my-votes` for each wallet returns their vote |

### Step 5 — W10 Vote Attempt (No INVX — Should Fail)

| Actor | W10 (Observer, 0 INVX) |
|---|---|
| Action | Attempt `InvestXGovernance.vote(proposalId, true)` |
| Expected | Transaction reverts: `"Governance: insufficient INVX"` |
| Verify | W10 cannot participate until they earn or acquire INVX |

### Step 6 — Wait for Voting Period to Expire

| Duration | 2 days (or set `VOTING_DURATION = 5 minutes` for testing) |
|---|---|
| Action | Wait for `block.timestamp > proposal.endTime` |
| Tip | Use Hardhat time manipulation in tests, or wait real time on testnet |

### Step 7 — Finalize Proposal

| Actor | Any wallet or automatic (proposalFinalizer cron) |
|---|---|
| Action | `POST /api/governance/proposals/:id/finalize` |
| Expected | 8 voters ≥ 3 quorum ✅ |
| Expected | 62.5% upvote ≥ 60% threshold ✅ → **PASSED** |
| Verify | `Proposal.status = 'passed'` in MongoDB |
| Verify | `Business.status = 'fundraising'` |
| Verify | On-chain: `InvestXGovernance.getVoteResult(proposalId)` returns passed=true |

### Step 8 — Verify Correct Voter Rewards

| Expected | Voters who voted with the majority (W2-W6 voted ✅ = correct) earn +3 INVX each |
|---|---|
| Expected | Voters who voted against (W7-W9 voted ❌ = incorrect) earn +0 bonus INVX |
| Verify | `RewardDistributor` events show `Rewarded(voter, 3 * 10^18)` for correct voters |

### Step 9 — BusinessToken Deployment

| Expected | After vote passes, `BusinessToken` contract deployed for the business |
|---|---|
| Verify | `Business.contractAddress` populated in MongoDB |
| Verify | Token has correct name, symbol, and supply |

### Step 10 — Investor Buys Tokens

| Actor | W5, W6, W8, W9 |
|---|---|
| Action | `POST /api/investments` — invest CELO via Escrow contract |
| Expected | Each investor receives business tokens proportional to CELO invested |
| INVX Earned | +10 INVX for first investment, +5 INVX for subsequent |
| Verify | `BusinessToken.balanceOf(investor)` > 0 |

### Step 11 — Submit Monthly Revenue Report

| Actor | W1 (Owner) |
|---|---|
| Action | `POST /api/businesses/:id/revenue` with revenue data + proof |
| Expected | Backend generates ZK proof (revenue range + business age) |
| Expected | Document hashes registered on `DocumentRegistry` |
| Verify | ZK proof object stored in revenue report record |

### Step 12 — ZK Proof Verification

| Expected | Proof shows: "Revenue > ₹30,000: TRUE" without revealing exact amount |
|---|---|
| Verify | `DocumentRegistry` has revenue hash attestation |
| Verify | Revenue report linked to governance proposal |

### Step 13 — Revenue Verification Governance Vote

| Expected | `REVENUE_VERIFICATION` proposal auto-created by `proposalCreator` |
|---|---|
| Notify | All INVX holders notified: "Revenue report needs verification" |
| Action | Voters review ZK proof + attestations, then vote |
| Votes | W2: ✅, W3: ✅, W4: ✅, W5: ✅, W6: ✅, W7: ✅ (6 upvotes / 0 downvotes) |
| Verify | After finalization: proposal passes at 100% approval |

### Step 14 — DividendDistributor Auto-Distribution

| Expected | `proposalFinalizer` calls `dividendDistributorService.distributeAfterVote()` |
|---|---|
| Expected | `DividendDistributor.distributeDividends()` sends CELO to investors |
| Verify | On-chain: `DividendDistributed` event emitted |
| Verify | Each investor wallet CELO balance increased proportionally |

### Step 15 — Verify Dividend Receipts

| Investor | Token Share | Expected Dividend |
|---|---|---|
| W5 | 30% | 0.30 × total CELO |
| W6 | 20% | 0.20 × total CELO |
| W8 | 25% | 0.25 × total CELO |
| W9 | 25% | 0.25 × total CELO |

| Verify | `DividendRecord` created in MongoDB for each investor |
| Verify | Each investor receives `'dividend_received'` notification |
| INVX | Each investor earns +3 INVX for receiving dividend |

### Step 16 — Final State Verification

| Check | Expected |
|---|---|
| Business status | `'active'` |
| Total INVX distributed | Sum of all rewards matches on-chain `RewardDistributor.totalDistributed()` |
| Investor token balances | Match escrow investment amounts |
| Notifications | All users have received appropriate notifications |
| Governance stats | `GET /api/governance/stats` returns accurate counts |
| Leaderboard | W2-W6 (most accurate) ranked highest |

---

## Test Parameters for Fast Testing

To avoid waiting 2 full days for voting periods, modify the governance contract or use these approaches:

```javascript
// Option A: Reduce VOTING_DURATION in InvestXGovernance.sol before re-deploying
uint256 public constant VOTING_DURATION = 5 minutes; // Instead of 2 days

// Option B: Use Hardhat local fork with time manipulation
const { time } = require("@nomicfoundation/hardhat-network-helpers");
await time.increase(2 * 24 * 60 * 60); // Fast-forward 2 days
```

---

## Edge Cases to Test

| # | Scenario | Expected |
|---|---|---|
| E1 | Double vote from same wallet | Revert: `"Governance: already voted"` |
| E2 | Vote after period ends | Revert: `"Governance: voting ended"` |
| E3 | Finalize before period ends | Revert: `"Governance: voting not ended"` |
| E4 | Business owner votes on own business | Backend rejects (middleware check) |
| E5 | User with 0 INVX tries to vote | Revert: `"Governance: insufficient INVX"` |
| E6 | Only 2 voters vote (below quorum 3) | Proposal auto-rejected |
| E7 | 60% exact threshold (3 yes / 2 no) | Passes (≥ 60%) |
| E8 | 59% threshold (59 yes / 41 no) | Rejected (< 60%) |

---

## Automated Test Commands

```bash
# Run smart contract tests (40 test cases)
cd smart-contracts
npx hardhat test test/Governance.test.js

# Run backend integration tests (15 test cases)
cd backend
node test/governance.test.js

# Full test suite
cd smart-contracts && npx hardhat test && cd ../backend && node test/governance.test.js
```
