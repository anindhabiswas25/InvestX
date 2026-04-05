# InvestX Testing Guide - Stellar Migration

## ✅ System Status

**Migration Complete**: Celo → Stellar
**Backend**: http://localhost:5000 
**Frontend**: http://localhost:3000
**Network**: Stellar Testnet
**Wallet**: Freighter

---

## 🔧 Quick Start

### 1. Prerequisites

- **Node.js** v18+ installed
- **MongoDB** running (cloud or local)
- **Freighter Wallet** extension installed ([freighter.app](https://freighter.app/))

### 2. Start Backend

```bash
cd backend
npm start
```

Expected output:
```
🚀 InvestX server running on port 5000 in development mode
[Stellar] Admin wallet loaded successfully: GAK5LEBNBCHHIEKJY5HU7GTYBBUCXFP4BYFK2SDPRN55FWR3VQXQ3DNN
✅ MongoDB Connected
```

### 3. Start Frontend

```bash
cd frontend
npm start
```

Expected output:
```
Compiled successfully!
You can now view investx-frontend in the browser.
Local: http://localhost:3000
```

---

## 🔑 Admin Wallet Credentials

**Public Key**: `GAK5LEBNBCHHIEKJY5HU7GTYBBUCXFP4BYFK2SDPRN55FWR3VQXQ3DNN`  
**Secret Key**: `SA7MNPMAVUBV3FF7NY6BB7HW2QD4ZMYGYUUJ6IASETNSMIIQ4HR24KKI`

### How to Import into Freighter:

1. Open Freighter extension
2. Click "Add Account" → "Import Account"
3. Paste the secret key above
4. Confirm and name it "InvestX Admin"
5. Make sure Freighter is set to **Testnet**

---

## 📋 Complete Testing Flow

### A. Investor Flow (Any Wallet)

#### 1. Connect Wallet as Investor

```
1. Go to http://localhost:3000
2. Click "Connect Wallet" button
3. Freighter popup appears → Click "Connect"
4. ✅ You're logged in as an investor
5. Navigate to "Explore Businesses" or "Dashboard"
```

**What Happens Behind the Scenes:**
- Frontend calls `/api/auth/wallet-connect` with your wallet address
- Backend creates an "investor" user automatically (no KYC needed)
- JWT token is issued and stored
- Wallet address is normalized and saved

#### 2. Browse Businesses

```
1. Click "Explore" in navbar
2. See list of businesses that are "fundraising"
3. Click on any business card
4. View business details, funding goal, revenue share %
```

#### 3. Invest in a Business

```
1. On business detail page, click "Invest Now"
2. Enter INR amount (e.g., 5000)
3. System calculates XLM amount needed
4. Click "Proceed to Payment"
5. Freighter popup → Approve XLM transfer
6. ✅ Investment confirmed!
```

**Technical Flow:**
- Frontend creates unsigned Stellar transaction
- Sends XDR to Freighter for signature
- Freighter signs and submits to Horizon
- Backend records investment with txHash
- User receives business tokens (tracked in DB)

---

### B. Business Owner Flow

#### 1. Register as Business Owner

```
1. Go to http://localhost:3000/raise-funds
2. Fill in:
   - Name, Email, Password, Phone
   - Connect your wallet address
3. Click "Register" → Account created
4. You'll be redirected to KYC page
```

#### 2. Complete KYC

```
1. Upload documents:
   - PAN Card
   - GST Certificate
   - Bank Statement
   - Business Photos (2-3)
2. Fill in business financials
3. Submit KYC
4. ✅ KYC verification starts (admin approval)
```

#### 3. Submit Business Application

```
1. After KYC approved, go to "Apply for Funding"
2. Fill in business details:
   - Business Name
   - Category (food_beverage, retail, etc.)
   - Description
   - Location (city, state, pincode)
   - GST Number (format: 07AAACH7409R1ZW)
   - Years in Operation
   - Average Monthly Revenue
   - Profit Margin %
   - Funding Goal (INR)
   - Token Price (INR per token)
   - Revenue Share % (e.g., 20%)
   - Revenue Sharing Duration (months, e.g., 24)
3. Upload:
   - Business photos (at least 2)
   - Documents (GST cert, financials, etc.)
4. Click "Submit Application"
```

**What Happens Next (Automated):**

```
After submission (3-second delay):
↓
Document Hashing & On-Chain Registration
↓
Status: "verifying"
↓
Automated Oracle Verification:
  ├─ GST format check ✓
  ├─ PAN format check ✓
  ├─ Business age check (>6 months) ✓
  ├─ Document completeness check ✓
  ├─ AI risk scoring (Gemini API) ✓
  └─ Funding goal reasonability check ✓
↓
Status: "vote_required"
↓
Governance Proposal Created Automatically
↓
Status: "voting"
↓
Voting Period: 15 minutes
↓
Community votes (min 3 voters, 60% approval needed)
↓
If approved: Status → "approved" (admin can then approve for fundraising)
If rejected: Status → "rejected"
```

#### 4. Check Application Status

```
1. Go to "Business Dashboard"
2. See your application status:
   - pending → verifying → vote_required → voting → approved/rejected
3. If voting, see proposal link to governance page
```

---

### C. Governance & Voting Flow

#### 1. View Active Proposals

```
1. Any user can go to http://localhost:3000/governance
2. See list of active governance proposals
3. Click on any proposal to view details
```

#### 2. Vote on Business Approval

```
Requirements:
- Must have wallet connected
- Must have INVX tokens (for testnet, all wallets get 100 INVX automatically)

Steps:
1. Connect wallet
2. Go to Governance → View proposal
3. Read business details and verification summary
4. Click "Vote For" or "Vote Against"
5. Confirm vote (no transaction needed in mock mode)
6. ✅ Vote recorded!
7. Earn 2 INVX for voting participation
```

**Voting Rules:**
- **Minimum Voters**: 3 people must vote
- **Approval Threshold**: 60% must vote "FOR"
- **Voting Duration**: 15 minutes from proposal creation
- **One Vote Per Person**: Can't vote twice on same proposal

#### 3. Auto-Finalization

```
After voting period ends (15 minutes):
↓
Cron job runs every 5 minutes
↓
Checks if proposal has expired
↓
Counts votes:
  - If >= 3 voters AND >= 60% voted FOR → APPROVED
  - Otherwise → REJECTED
↓
Updates business status
↓
Notifies business owner
```

---

### D. Admin Flow

#### 1. Connect as Admin

```
1. Import admin wallet into Freighter (secret key above)
2. Go to http://localhost:3000
3. Click "Connect Wallet"
4. ✅ Recognized as admin automatically
5. Redirected to /admin dashboard
```

#### 2. Admin Dashboard

```
Access: http://localhost:3000/admin

Features:
- View pending KYC applications
- Approve/reject business owners' KYC
- View businesses awaiting final approval
- Approve businesses for fundraising (after governance passes)
- View revenue verification requests
- Verify and approve dividend distributions
```

#### 3. Approve Business for Fundraising

```
After governance approval:

1. Go to Admin → Applications
2. Find business with status "approved"
3. Review details
4. Click "Approve for Fundraising"
5. System:
   - Creates business token contract on Stellar
   - Sets fundraising deadline (30 days)
   - Changes status to "fundraising"
6. ✅ Business is now live for investments!
```

#### 4. Verify Revenue & Distribute Dividends

```
When business owner submits monthly revenue:

1. Admin receives notification
2. Go to Admin → Revenue Verification
3. Review submitted revenue report
4. Verify documents and bank statements
5. Options:
   a) Approve → Creates dividend distribution
   b) Request Revote → Creates governance proposal
   c) Reject → Business owner must re-submit
6. If approved:
   - Dividends calculated based on revenue share %
   - XLM distributed to all investors proportionally
```

---

## 🔍 Testing Checklist

### ✅ Wallet Connection

- [ ] Investor can connect any wallet
- [ ] Admin wallet is recognized automatically
- [ ] Wallet disconnect works
- [ ] Switching wallets re-authenticates correctly
- [ ] No "Network Error" on page navigation

### ✅ User Flows

- [ ] Investor can browse businesses
- [ ] Investor can invest in a business
- [ ] Business owner can register
- [ ] Business owner can complete KYC
- [ ] Business owner can submit application
- [ ] Admin can approve KYC
- [ ] Admin can approve business for fundraising

### ✅ Governance System

- [ ] Business application triggers automated verification
- [ ] Oracle checks pass/fail correctly
- [ ] Governance proposal is created automatically
- [ ] Proposal appears in /governance
- [ ] Users can vote FOR or AGAINST
- [ ] Vote counts are tracked correctly
- [ ] Minimum voter requirement enforced (3 voters)
- [ ] 60% approval threshold enforced
- [ ] Proposals auto-finalize after 15 minutes
- [ ] INVX rewards given for voting

### ✅ Fund Raising Flow

- [ ] Approved business shows in "Explore"
- [ ] Funding progress bar updates correctly
- [ ] Investment creates XLM transaction
- [ ] Transaction hash is recorded
- [ ] Investor receives business tokens
- [ ] Funding goal completion changes status to "funded"

---

## 🐛 Common Issues & Fixes

### Issue 1: "Wallet auth failed: Network Error"

**Cause**: Backend not running or wrong URL

**Fix**:
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Should return: {"success":true,"message":"InvestX API is healthy"}

# If not, restart backend:
cd backend
npm start
```

### Issue 2: Admin wallet not recognized

**Cause**: Wallet address mismatch in .env files

**Fix**: Verify these files have the correct admin wallet:

`backend/.env`:
```
STELLAR_ADMIN_PUBLIC_ADDRESS=GAK5LEBNBCHHIEKJY5HU7GTYBBUCXFP4BYFK2SDPRN55FWR3VQXQ3DNN
```

`frontend/.env`:
```
REACT_APP_ADMIN_WALLET=GAK5LEBNBCHHIEKJY5HU7GTYBBUCXFP4BYFK2SDPRN55FWR3VQXQ3DNN
```

### Issue 3: Freighter not connecting

**Cause**: Extension not installed or wrong network

**Fix**:
1. Install from https://freighter.app/
2. Open Freighter settings
3. Switch to "Testnet"
4. Refresh page and try again

### Issue 4: Governance proposal not created

**Cause**: Mock contracts not initialized

**Fix**: Restart backend server - it will initialize mock governance on startup

### Issue 5: Can't vote on proposal

**Cause**: Wallet not connected or already voted

**Fix**:
1. Make sure wallet is connected
2. Check you haven't voted already
3. Ensure proposal is still "active" (not expired)

---

## 📊 Database Verification

### Check Proposals

```bash
# In MongoDB Compass or mongo shell
db.proposals.find().pretty()

# Should see proposals with:
# - proposalId: 1, 2, 3...
# - businessId: reference to business
# - status: "active", "approved", "rejected"
# - votingEndsAt: timestamp
```

### Check Votes

```bash
db.votes.find().pretty()

# Should see votes with:
# - proposalId: matches proposal
# - userId: reference to user
# - support: true/false
# - voteWeight: "1" or INVX balance
# - txHash: mock transaction hash
```

### Check Businesses

```bash
db.businesses.find({ status: "voting" }).pretty()

# Should see businesses going through voting
```

---

## 🚀 Next Steps

1. **Test Full Flow**:
   - Register business → Wait for verification → Vote with 3 wallets → Check approval

2. **Test Edge Cases**:
   - Try voting twice (should fail)
   - Try voting after deadline (should fail)
   - Submit business with invalid GST (should be flagged)

3. **Performance Testing**:
   - Create 10 businesses simultaneously
   - Have 20 users vote on same proposal
   - Check cron jobs are finalizing proposals correctly

4. **Deploy to Production**:
   - Replace mock governance with real Soroban contracts
   - Deploy contracts to Stellar Mainnet
   - Update .env with production credentials
   - Add real INVX token contract
   - Enable rate limiting in server.js

---

## 📞 Support

If you encounter issues:

1. Check backend console for error messages
2. Check frontend browser console (F12)
3. Check MongoDB for data consistency
4. Verify .env files have correct values
5. Try restarting both servers

---

## 🎉 Success Metrics

Your system is working correctly if:

- ✅ Investors can connect wallet and browse businesses
- ✅ Business owners can apply and see automated verification
- ✅ Governance proposals are created automatically
- ✅ Users can vote and see live vote counts
- ✅ Proposals finalize after 15 minutes with correct results
- ✅ Admin can approve businesses for fundraising
- ✅ Investments create real Stellar transactions
- ✅ No "Network Error" or wallet connection issues

---

**Migration Status**: ✅ COMPLETE  
**Blockchain**: ✅ Stellar Testnet  
**Smart Contracts**: 🟡 Mock (Database-only for testing)  
**Frontend**: ✅ Working  
**Backend**: ✅ Working  
**Governance**: ✅ Functional  
**Wallet Integration**: ✅ Freighter

---

*Last Updated: March 31, 2026*
