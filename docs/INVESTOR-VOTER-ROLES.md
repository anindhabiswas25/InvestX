# InvestX — How Investor + Voter Roles Work Together

> **Version:** 1.0  
> **Last Updated:** June 2025  
> **Core Principle:** Every user is both an investor AND a voter. No admin decides which businesses get listed — the community does.

---

## The Dual Role System

In InvestX, there is **no separation** between investors and voters. Every user who holds INVX governance tokens can:

1. **Vote** on which businesses get approved for fundraising
2. **Invest** CELO into approved businesses to buy fractional ownership tokens
3. **Earn dividends** from businesses they've invested in
4. **Vote** on monthly revenue verification reports
5. **Earn more INVX** through all of the above activities

This creates a self-reinforcing incentive loop where the most active, thoughtful participants gain the most influence.

---

## Business Lifecycle — 5 Phases

### Phase 1: Application Submitted

```
State:     Business Status = 'verifying'
Duration:  Automatic (oracle verification takes ~1 minute)
```

| What Happens | Detail |
|---|---|
| Business owner submits application | PAN, GST, photos, bank proof uploaded |
| Oracle verification service activates | Backend validates document formats and registers hashes on-chain |
| Document hashes stored on `DocumentRegistry` | Each doc gets a SHA-256 hash stored immutably |
| Attestations created on-chain | GST format ✅, PAN format ✅, photo exists ✅, bank proof ✅ |
| **User action** | Nothing — automatic process |

### Phase 2: Community Voting (2 Days)

```
State:     Business Status = 'voting'
Duration:  2 days (48 hours)
```

| What Happens | Detail |
|---|---|
| Governance proposal auto-created | Once ≥ 3 attestations exist, proposal is submitted to `InvestXGovernance` contract |
| All INVX holders notified | `'new_proposal'` notification sent |
| Users review attestations | See on-chain evidence: "GST verified ✅", "PAN verified ✅" |
| Users cast votes on-chain | Each voter signs a `vote(proposalId, support)` transaction via MetaMask |
| **User CAN** | Vote (if they hold INVX tokens) |
| **User CANNOT** | Invest yet — business not yet approved |
| **INVX earned** | +2 INVX for participating in vote |

**Voting Rules:**
- Minimum 3 voters required (quorum)
- 60% approval threshold to pass
- Single voter capped at 20% of total voting weight (anti-whale)
- Each vote is final and immutable on-chain

### Phase 3: Vote Passed → Fundraising

```
State:     Business Status = 'fundraising'
Duration:  Until funding target reached
```

| What Happens | Detail |
|---|---|
| Business approved by community vote | ≥ 3 voters, ≥ 60% approval |
| `BusinessToken` contract deployed | ERC-20 token representing fractional ownership |
| Fundraising campaign opens | Users can invest CELO via `Escrow` contract |
| **User CAN** | Invest CELO to buy business tokens |
| **INVX earned** | +10 INVX for first investment, +5 INVX for subsequent |
| **INVX earned** | +3 INVX if vote was correct (voted with majority) |

### Phase 4: Fully Funded → Active

```
State:     Business Status = 'active'
Duration:  Ongoing (monthly revenue cycles)
```

| What Happens | Detail |
|---|---|
| Funding target reached | All CELO collected in Escrow |
| CELO released to business owner | Escrow transfers funds |
| Business begins operations | Owner uses funds to grow business |
| **User IS** | An investor (holds business tokens) |
| **User CAN** | Vote on monthly revenue verification reports |
| **INVX earned** | +3 INVX for voting on revenue reports |
| **INVX earned** | +3 INVX if revenue vote was correct |
| **CELO earned** | Monthly dividends proportional to token holdings |
| **INVX earned** | +3 INVX for receiving dividend |

### Phase 5: Monthly Revenue Cycle

```
State:     REVENUE_VERIFICATION proposal active
Duration:  2-day voting period per month
```

| What Happens | Detail |
|---|---|
| Business owner submits revenue report | Revenue data + bank statement |
| Backend generates ZK proof | "Revenue > ₹30,000: TRUE" (exact amount hidden) |
| Hashes registered on `DocumentRegistry` | Revenue evidence stored cryptographically |
| Governance proposal auto-created | `REVENUE_VERIFICATION` type proposal |
| Community votes to verify/dispute | Voters review ZK proof + attestations |
| If vote passes → dividends distributed | `DividendDistributor` sends CELO to all investors |
| If vote fails → funds locked | Dispute resolution (future: arbitration) |

---

## Conflict of Interest Rules

### Rule 1: No Self-Voting

```
Business owners CANNOT vote on their OWN business proposals.
```

| Enforcement | Backend middleware checks if `msg.sender === business.ownerWalletAddress` |
|---|---|
| Scope | Applies to both BUSINESS_APPROVAL and REVENUE_VERIFICATION proposals |
| Exception | Business owners CAN vote on ALL other businesses |

### Rule 2: Investors CAN Vote on Revenue

```
Investors in a business CAN vote on that business's revenue verification.
```

| Rationale | This is NOT a conflict — it's alignment of interests |
|---|---|
| Why | Investors WANT accurate revenue reports because correct reports = dividends |
| Effect | Creates a community of stakeholders who actively monitor business performance |

### Rule 3: Immutable Votes

```
All votes are final and stored on-chain.
```

| Cannot | Change your vote after casting |
|---|---|
| Cannot | Delete or hide your vote |
| Anyone can | Verify any voter's complete voting history via block explorer |

### Rule 4: Transparent Identity

```
No anonymous voting in the final system.
```

| Votes linked to | Wallet addresses (public on-chain) |
|---|---|
| Wallet linked to | Real KYC identity (visible in admin view) |
| Public visibility | Anyone can see wallet → vote history |
| Effect | Voters know their patterns are auditable, promoting honest behavior |

---

## INVX Earning Scenarios

### Complete 2-Month User Journey

```
Month 1:
┌─────────┬───────────────────────────────────┬────────┬─────────┐
│  Week   │  Action                           │ INVX ± │ Total   │
├─────────┼───────────────────────────────────┼────────┼─────────┤
│ Week 1  │ KYC verified                      │ +5     │ 5       │
│ Week 1  │ Invest in Business A              │ +10    │ 15      │
│ Week 2  │ Vote on Business B (approved)     │ +2     │ 17      │
│ Week 2  │ Vote was correct ✅               │ +3     │ 20      │
│ Week 3  │ Vote on Business C (approved)     │ +2     │ 22      │
│ Week 3  │ Vote was wrong ❌ (voted reject)  │ +0     │ 22      │
│ Week 4  │ Dividend from Business A          │ +3     │ 25      │
└─────────┴───────────────────────────────────┴────────┴─────────┘

Month 2:
┌─────────┬───────────────────────────────────┬────────┬─────────┐
│  Week   │  Action                           │ INVX ± │ Total   │
├─────────┼───────────────────────────────────┼────────┼─────────┤
│ Week 1  │ Vote on Business D (approved)     │ +2     │ 27      │
│ Week 1  │ Vote was correct ✅               │ +3     │ 30      │
│ Week 2  │ Invest in Business B              │ +5     │ 35      │
│ Week 2  │ Vote on A revenue (verified)      │ +2     │ 37      │
│ Week 2  │ Vote was correct ✅               │ +3     │ 40      │
│ Week 4  │ Dividends from A + B              │ +6     │ 46      │
└─────────┴───────────────────────────────────┴────────┴─────────┘

Final Voting Power: min(46 INVX, 20% of total supply)
```

### INVX Reward Table

| Action | INVX Reward | Frequency |
|---|---|---|
| Complete KYC verification | +5 INVX | One-time |
| First investment in any business | +10 INVX | One-time |
| Subsequent investments | +5 INVX | Per investment |
| Cast vote on any proposal | +2 INVX | Per vote |
| Vote aligns with final result | +3 INVX | Per correct vote |
| Receive dividend payout | +3 INVX | Per dividend |

### Voting Power Mechanics

```
Your Voting Power = min(your_INVX_balance, 20% × total_INVX_supply)
                    ────────────────────────────────────────────────── × 100%
                              total_INVX_among_all_voters
```

**The 20% cap** prevents any single whale from dominating governance. Even if a user holds 60% of all INVX, their vote counts as only 20%.

---

## Key Design Principles

### 1. No Trust in Any Single Party

```
Smart contracts enforce rules, not admins.
Votes are immutable on-chain.
Document proofs are cryptographic, not human-verified.
```

- Admin cannot approve or reject businesses (routes return 410 Gone)
- The `proposalFinalizer` cron automatically processes expired proposals
- All thresholds (quorum, approval %) are enforced in Solidity

### 2. Privacy with Transparency

| Layer | Visibility | Why |
|---|---|---|
| Documents | **Private** — only hashes stored on-chain | Business confidential data protected |
| Attestations | **Public** — "GST verified", "PAN verified" | Voters need evidence to decide |
| Voter choices | **Public** — wallet + vote on-chain | Accountability and auditability |
| Revenue amounts | **Range only** — ZK proof hides exact figure | "Revenue > ₹30K" without revealing ₹45K |

### 3. Incentive Alignment

```
More accurate votes   → More INVX → More voting power → Better governance
More investment       → More INVX → More voting power → Better governance
Bad voting patterns   → No bonus INVX → Relative influence shrinks
```

The system naturally amplifies the influence of participants who make good decisions and reduces the influence of careless voters over time.

### 4. Sybil Resistance (Anti-Fake-Account)

| Protection | Mechanism |
|---|---|
| INVX only earned through real actions | Must invest real CELO or complete KYC |
| KYC verification required | Aadhaar + PAN + selfie verification |
| Vote weight ∝ financial stake | More invested = more governance weight |
| 20% cap per voter | Prevents single-wallet dominance |

### 5. Graceful Scaling

```
10 users:    Works perfectly with 3-voter quorum
100 users:   Same contracts, same rules
1000 users:  Parameters adjustable by governance vote itself
```

The minimum quorum (3 voters) and approval threshold (60%) are designed for the current scale. As the platform grows, these parameters can be adjusted through the governance system itself — a proposal to change governance parameters follows the same voting process.

---

## System Flow Diagram

```
    ┌─────────────────┐
    │  New Business    │
    │  Application     │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Oracle          │  Automatic: hash docs, create attestations
    │  Verification    │  on DocumentRegistry contract
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Governance      │  2-day community vote
    │  Proposal        │  Minimum 3 voters, 60% approval
    │  Created         │
    └────────┬────────┘
             │
        ┌────┴─────┐
        ▼          ▼
   ┌────────┐  ┌────────┐
   │ PASSED │  │ FAILED │ → Business rejected
   │ (≥60%) │  │ (<60%) │
   └───┬────┘  └────────┘
       │
       ▼
   ┌─────────────────┐
   │  BusinessToken   │  Fractional ownership tokens
   │  Deployed        │  deployed on Celo
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │  Fundraising     │  Users invest CELO via Escrow
   │  Opens           │  Receive business tokens
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │  Business        │  Owner receives CELO
   │  Active          │  Begins operations
   └────────┬────────┘
            │
            ▼  (Monthly)
   ┌─────────────────┐
   │  Revenue Report  │  Owner submits → ZK proof generated
   │  + ZK Proof      │  "Revenue > ₹30K: TRUE"
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │  Community Vote  │  Verify revenue legitimacy
   │  on Revenue      │
   └────────┬────────┘
            │
       ┌────┴─────┐
       ▼          ▼
  ┌────────┐  ┌────────┐
  │ VERIFY │  │ DISPUTE│ → Funds locked
  │ (≥60%) │  │ (<60%) │
  └───┬────┘  └────────┘
      │
      ▼
  ┌─────────────────┐
  │  Dividends       │  DividendDistributor auto-sends
  │  Distributed     │  CELO to all token holders
  └─────────────────┘
```

---

## Technical Implementation Details

### Smart Contracts

| Contract | Role in Dual System |
|---|---|
| `INVXToken` | Tracks voting power for each wallet |
| `RewardDistributor` | Mints INVX for voting, investing, KYC |
| `InvestXGovernance` | Records votes, enforces quorum + threshold + 20% cap |
| `DocumentRegistry` | Stores evidence voters review before voting |
| `DividendDistributor` | Auto-distributes CELO when revenue vote passes |
| `Escrow` | Holds and releases investment CELO |
| `BusinessToken` | ERC-20 representing fractional ownership shares |

### Backend Services

| Service | Role |
|---|---|
| `oracle.service.js` | Verifies docs → creates on-chain attestations |
| `proposalCreator.service.js` | Auto-creates governance proposals |
| `proposalFinalizer.service.js` | Auto-finalizes expired proposals + triggers rewards/dividends |
| `reward.service.js` | Issues INVX rewards for user actions |
| `notification.service.js` | Notifies users about votes, results, dividends |
| `dividendDistributor.service.js` | Interacts with DividendDistributor contract |
| `zkProof.service.js` | Generates ZK proofs for revenue verification |

### Frontend Pages

| Page | For Voters | For Investors |
|---|---|---|
| `GovernancePage` | View & vote on proposals | See upcoming investment opportunities |
| `ProposalDetailPage` | Review attestations, cast vote | See business details before investing |
| `GovernanceAnalyticsPage` | View leaderboard, accuracy stats | See platform health metrics |
| `BusinessDetailPage` | See governance status | Invest in approved businesses |
| `DashboardPage` | See INVX balance, voting power | See portfolio, dividends |
