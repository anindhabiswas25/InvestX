# InvestX Migration Status: Mock to On-Chain Architecture

**Last Updated:** April 3, 2026  
**Status:** ~90% Complete - Cleanup Remaining

---

## Overview

Migration from mock-based architecture to fully on-chain data fetching on Stellar/Soroban blockchain.

### Key Changes
1. **Removed INVX token system entirely** - No more governance token, rewards, or token-weighted voting
2. **Implemented 1-wallet-1-vote governance** - Any registered user can vote with equal weight
3. **On-chain data fetching** - All financial/transactional data comes from Soroban contracts
4. **MongoDB only for user/business profile data** - User registration info, business metadata, notifications
5. **Wallet signup flow** - New wallets must provide name + email on first connect before investing/voting

---

## Voting Rules

| Proposal Type | Who Can Vote |
|--------------|--------------|
| Business Approval | Any connected wallet (1 wallet = 1 vote) |
| Revenue Verification | Only investors of that specific business (check BusinessToken balance on-chain) |

---

## Contract IDs (Testnet)

```
GOVERNANCE_CONTRACT_ID=CDDGMY65YWEXY3IRI7UWO27N3W456RWWSUVQ44YHTNYTFYSGUDRMVBJH
ESCROW_CONTRACT_ID=CDQJFA7FWAFENCOBGYI5YTEIIIV2JWYWGPKMFTSKZCS3GVSVPSVDULXU
DIVIDEND_CONTRACT_ID=CDH35PFTCU2WXPQ3LW4NFDJADNCEKK7RNH2UUNH5JRKFZ7O7U3UCFY6C
DOCUMENT_REGISTRY_ID=CAIE2RAQSPRSEAE6T2QAFLLCVKHBGGNLNWT2W3VWAEFCRM6ZLN4NCULJ
```

---

## Completed Work

### Phase 1: Governance Contract Modification
- [x] Modified `governance-contract/src/lib.rs` to remove INVX dependency
- [x] Removed `get_effective_weight()` function, INVX balance checks, token-weighted voting
- [x] Set `effective_weight = 1` for all voters (1-wallet-1-vote)
- [x] Built and deployed new contract to testnet

### Phase 2: Backend - Deleted Files
- [x] `backend/src/models/INVXReward.js`
- [x] `backend/src/models/Investment.js`
- [x] `backend/src/models/Proposal.js`
- [x] `backend/src/models/Vote.js`
- [x] `backend/src/services/invxReward.service.js`

### Phase 3: Backend - Rewritten Files
- [x] `backend/src/services/stellar.service.js` - Added Soroban contract query functions
- [x] `backend/src/config/governance.js` - Removed all mock classes, uses real contract calls
- [x] `backend/src/controllers/governance.controller.js` - Fetches from on-chain
- [x] `backend/src/controllers/investment.controller.js` - Uses on-chain token balances
- [x] `backend/src/controllers/auth.controller.js` - Added `walletSignup` endpoint
- [x] `backend/src/routes/auth.routes.js` - Added `/wallet-signup` route
- [x] `backend/src/controllers/user.controller.js`
- [x] `backend/src/controllers/admin.controller.js`
- [x] `backend/src/controllers/dividend.controller.js`
- [x] `backend/src/controllers/business.controller.js`
- [x] `backend/src/services/proposalCreator.service.js`
- [x] `backend/src/services/proposalFinalizer.service.js`
- [x] `backend/src/services/notification.service.js`
- [x] `backend/src/services/dividendDistributor.service.js`
- [x] `backend/src/services/deadlineChecker.service.js`

### Phase 4: Frontend - Deleted Files
- [x] `frontend/src/components/governance/INVXBalance.jsx`

### Phase 5: Frontend - Created Files
- [x] `frontend/src/components/common/WalletSignupModal.jsx` - Modal for new wallet registration

### Phase 6: Frontend - Modified Files
- [x] `frontend/src/services/auth.api.js` - Added `walletSignupApi`
- [x] `frontend/src/services/governance.api.js` - Removed `getMyINVX`
- [x] `frontend/src/context/AuthContext.jsx` - Added `walletSignup`, `cancelWalletSignup`, `pendingWallet`
- [x] `frontend/src/context/WalletContext.jsx` - Integrated with AuthContext for signup flow
- [x] `frontend/src/components/common/WalletAuthBridge.jsx` - Renders WalletSignupModal
- [x] `frontend/src/pages/governance/GovernancePage.jsx` - Removed INVX references
- [x] `frontend/src/pages/governance/ProposalDetailPage.jsx` - Removed INVX references
- [x] `frontend/src/pages/investor/InvestorDashboard.jsx` - Removed INVX Balance and KYC banner

### Phase 7: Database Cleanup (Manual Step Required)
Collections to drop from MongoDB:
```javascript
db.invxrewards.drop()
db.investments.drop()
db.proposals.drop()
db.votes.drop()
```

---

## Remaining Work (TODO)

### HIGH PRIORITY: Broken Backend Scripts
These scripts import deleted models and will crash if run. **Delete or rewrite them:**

| Script | Broken Imports |
|--------|---------------|
| `backend/scripts/retroRewardINVX.js` | Investment, INVXReward, invxReward.service |
| `backend/scripts/fixMaTaraHotelDividend.js` | Investment |
| `backend/scripts/fixAndFinalizeMaTara.js` | Proposal, Investment |
| `backend/scripts/recoverInvestment.js` | Investment |
| `backend/scripts/createProposal.js` | Proposal |
| `backend/scripts/diagnoseEscrow.js` | Investment |
| `backend/scripts/deployMaTaraToken.js` | Investment |
| `backend/scripts/distributeDividend.js` | Investment |
| `backend/scripts/diagnoseDividends.js` | Investment |
| `backend/scripts/checkBusinessStatus.js` | Investment |

**Recommended Action:** Delete all these scripts as they were one-off migration/debug tools.

### HIGH PRIORITY: Frontend INVX References
Update these files to remove INVX token messaging and reflect 1-wallet-1-vote:

#### `frontend/src/components/governance/VotingPanel.jsx`
| Line | Current | Change To |
|------|---------|-----------|
| 66 | `"+2 INVX earned"` | Remove or change to "Vote recorded" |
| 110 | `"You earned +2 INVX"` | Remove entirely |
| 150 | `"Min 1 INVX required"` | Remove - no minimum required |
| 184 | `"Voting power is proportional to your INVX balance"` | `"Each wallet has 1 vote"` |

#### `frontend/src/pages/governance/MyVotesPage.jsx`
| Line | Current | Change To |
|------|---------|-----------|
| 37 | `invxEarned` variable | Remove or repurpose |
| 80-81 | `"INVX Earned"` label | Remove this stat card |
| 147 | `"Correct (+3 INVX)"` | `"Correct"` |

#### `frontend/src/pages/governance/GovernanceAnalyticsPage.jsx`
| Line | Current | Change To |
|------|---------|-----------|
| 168 | `"INVX Distributed"` | Remove this stat |
| 171 | `{stats?.totalINVXDistributed}` | Remove |
| 174 | `"Total INVX tokens distributed as rewards"` | Remove |
| 204 | Column header: `"INVX"` | Remove column |
| 250 | `{v.invxBalance}` | Remove |
| 359-361 | `INVX_REWARD_AMOUNTS` | Remove |

#### `frontend/src/pages/public/BusinessDetailPage.jsx`
| Line | Current | Change To |
|------|---------|-----------|
| 217 | `"INVX token holders can vote on approval."` | `"Connected wallets can vote on approval (1 wallet = 1 vote)."` |

#### `frontend/src/pages/admin/AdminDashboard.jsx`
| Line | Current | Change To |
|------|---------|-----------|
| 37 | `"community voting via INVX governance tokens"` | `"community voting (1 wallet = 1 vote)"` |
| 96 | `"INVX token holders"` | `"registered users"` |

### LOW PRIORITY: Notification Cleanup

#### `frontend/src/components/common/NotificationBell.jsx`
- Line 74: Remove `invx_earned` notification type color mapping

#### `backend/src/models/Notification.js`
- Line 19: Remove `'invx_earned'` from notification types enum

### LOW PRIORITY: Legacy Endpoint Cleanup

#### `backend/src/controllers/user.controller.js`
- Lines 165-175: `getMyINVX` function - consider renaming to `getVotingPower`

#### `backend/src/routes/user.routes.js`
- Lines 10, 20-21: Rename route from `/api/users/me/invx` to `/api/users/me/voting-power`

### LOW PRIORITY: Stellar Service Memo

#### `backend/src/services/stellar.service.js`
- Line 205: Change `'INVX dividend'` memo to `'Dividend'`

---

## Files Reference by Category

### Smart Contracts
```
smart-contracts/soroban-contracts/governance-contract/src/lib.rs  [MODIFIED]
smart-contracts/soroban-contracts/target/wasm32-unknown-unknown/release/governance_contract.optimized.wasm  [DEPLOYED]
```

### Backend - Services
```
backend/src/services/stellar.service.js  [MODIFIED - core Soroban integration]
backend/src/services/proposalCreator.service.js  [MODIFIED]
backend/src/services/proposalFinalizer.service.js  [MODIFIED]
backend/src/services/notification.service.js  [MODIFIED]
backend/src/services/dividendDistributor.service.js  [MODIFIED]
backend/src/services/deadlineChecker.service.js  [MODIFIED]
backend/src/services/invxReward.service.js  [DELETED]
```

### Backend - Controllers
```
backend/src/controllers/auth.controller.js  [MODIFIED - wallet signup]
backend/src/controllers/governance.controller.js  [MODIFIED - on-chain queries]
backend/src/controllers/investment.controller.js  [MODIFIED - on-chain balances]
backend/src/controllers/user.controller.js  [MODIFIED]
backend/src/controllers/admin.controller.js  [MODIFIED]
backend/src/controllers/dividend.controller.js  [MODIFIED]
backend/src/controllers/business.controller.js  [MODIFIED]
```

### Backend - Models
```
backend/src/models/INVXReward.js  [DELETED]
backend/src/models/Investment.js  [DELETED]
backend/src/models/Proposal.js  [DELETED]
backend/src/models/Vote.js  [DELETED]
```

### Backend - Config
```
backend/src/config/governance.js  [MODIFIED - removed mocks]
backend/.env  [MODIFIED - contract IDs]
```

### Backend - Routes
```
backend/src/routes/auth.routes.js  [MODIFIED - wallet-signup route]
```

### Frontend - Context
```
frontend/src/context/AuthContext.jsx  [MODIFIED - wallet signup flow]
frontend/src/context/WalletContext.jsx  [MODIFIED - auth integration]
```

### Frontend - Components
```
frontend/src/components/common/WalletSignupModal.jsx  [CREATED]
frontend/src/components/common/WalletAuthBridge.jsx  [MODIFIED]
frontend/src/components/governance/INVXBalance.jsx  [DELETED]
frontend/src/components/governance/VotingPanel.jsx  [NEEDS UPDATE]
frontend/src/components/common/NotificationBell.jsx  [NEEDS UPDATE]
```

### Frontend - Pages
```
frontend/src/pages/governance/GovernancePage.jsx  [MODIFIED]
frontend/src/pages/governance/ProposalDetailPage.jsx  [MODIFIED]
frontend/src/pages/governance/MyVotesPage.jsx  [NEEDS UPDATE]
frontend/src/pages/governance/GovernanceAnalyticsPage.jsx  [NEEDS UPDATE]
frontend/src/pages/investor/InvestorDashboard.jsx  [MODIFIED]
frontend/src/pages/public/BusinessDetailPage.jsx  [NEEDS UPDATE]
frontend/src/pages/admin/AdminDashboard.jsx  [NEEDS UPDATE]
```

### Frontend - Services
```
frontend/src/services/auth.api.js  [MODIFIED - walletSignupApi]
frontend/src/services/governance.api.js  [MODIFIED - removed getMyINVX]
```

---

## Quick Commands

### Delete Broken Scripts (PowerShell)
```powershell
cd D:\Projects\InvestX\backend\scripts
Remove-Item retroRewardINVX.js, fixMaTaraHotelDividend.js, fixAndFinalizeMaTara.js, recoverInvestment.js, createProposal.js, diagnoseEscrow.js, deployMaTaraToken.js, distributeDividend.js, diagnoseDividends.js, checkBusinessStatus.js
```

### Drop MongoDB Collections
```javascript
// Connect to MongoDB and run:
use investx
db.invxrewards.drop()
db.investments.drop()
db.proposals.drop()
db.votes.drop()
```

### Search for Remaining INVX References
```powershell
# Backend
rg -i "invx" backend/src --type js

# Frontend
rg -i "invx" frontend/src --type jsx --type js
```

---

## Architecture Summary (Post-Migration)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ WalletContext│──│ AuthContext  │──│ WalletSignupModal      │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend API                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ stellar.service.js - Soroban contract queries            │   │
│  │  - queryGovernanceContract()                             │   │
│  │  - queryBusinessTokenBalance()                           │   │
│  │  - queryEscrowContract()                                 │   │
│  │  - queryDividendContract()                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌─────────────────────┐                ┌─────────────────────────┐
│   Stellar Testnet   │                │       MongoDB           │
│   (Soroban)         │                │                         │
│                     │                │  - User profiles        │
│  - Governance       │                │  - Business metadata    │
│  - Escrow           │                │  - Notifications        │
│  - Dividend         │                │  - KYC status           │
│  - BusinessToken    │                │                         │
│  - DocumentRegistry │                │  [NO investments,       │
│                     │                │   proposals, votes]     │
└─────────────────────┘                └─────────────────────────┘
```

---

## Notes

- The testnet admin account was funded via Stellar friendbot before contract deployment
- Anti-sybil protection: None implemented (simple 1-wallet-1-vote approach)
- Contract ABIs in `backend/src/contracts/` still reference INVX - this is intentional for the Solidity/EVM side if needed
