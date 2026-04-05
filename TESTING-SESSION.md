# InvestX Testing Session - Ready for End-to-End Testing

**Date:** April 3, 2026  
**Status:** ✅ SERVERS RUNNING - READY FOR TESTING

---

## 🎯 System Status

### ✅ Disk Space Issue - RESOLVED
- **D: Drive Free Space:** 9.21 GB (previously 0 GB)
- **Uploads Directory:** `D:\Projects\InvestX\backend\uploads\` - Ready
- **Subdirectories:** 
  - ✅ `selfies/` - Exists
  - ✅ `documents/` - Exists

### ✅ Servers Running

#### Backend API Server
- **Status:** ✅ Running
- **URL:** http://localhost:5000
- **Health Check:** ✅ API is healthy
- **Process ID:** 22480
- **Log Location:** `D:\Projects\InvestX\backend\backend_run.log`

#### Frontend React App
- **Status:** ✅ Running
- **URL:** http://localhost:3000
- **Process ID:** 20864
- **Browser:** Should auto-open in your default browser

---

## 🚀 Quick Start Testing Guide

### Access URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

---

## 📋 Complete Testing Flow

### Phase 1: KYC Flow ✅ Ready
**Test:** New business owner registration and KYC with document uploads

**Steps:**
1. Open http://localhost:3000
2. Click **"Register"**
3. Fill form:
   - Name: `Test Business Owner`
   - Email: `owner@test.com`
   - Password: `Test@123`
   - Role: **Business Owner**
4. Login after registration
5. Connect **Freighter Wallet** (must be on Stellar Testnet)
6. Navigate to **KYC** page
7. Submit KYC:
   - Aadhaar: `123456789012` (12 digits)
   - PAN: `ABCDE1234F`
   - Upload selfie (JPEG/PNG, < 5MB)
8. ✅ **Expected:** Success without `ENOSPC` error
9. ✅ **Wait 5 sec:** KYC auto-verifies

**Files to Check:**
- `D:\Projects\InvestX\backend\uploads\selfies\[timestamp]-[hash].jpg` - Should exist

---

### Phase 2: Business Application ✅ Ready
**Test:** Submit business funding application with documents

**Steps:**
1. Click **"Apply for Funding"**
2. Fill 5-step form:
   - **Step 1:** Business name, category, description
   - **Step 2:** Address, city, state, pincode
   - **Step 3:** GST number, revenue, profit margin, **upload documents**
   - **Step 4:** Funding goal, token price, revenue share %
   - **Step 5:** **Upload business photos**, review, submit
3. ✅ **Expected:** Application submitted successfully

**Files to Check:**
- `D:\Projects\InvestX\backend\uploads\documents\*.pdf` - Documents uploaded
- `D:\Projects\InvestX\backend\uploads\business-photos\*.jpg` - Photos uploaded

---

### Phase 3: On-Chain Verification ✅ Ready
**Test:** Automated oracle verification and attestation creation

**Monitor:**
- Backend console logs for verification progress
- Business status changes: `pending` → `verifying` → `vote_required` → `voting`

**Expected Logs:**
```
📝 Registering [X] document hashes on-chain...
🔍 Starting oracle verification...
✅ GST format: valid
✅ PAN format: valid
✅ Business age: passed
✅ Document completeness: passed
✅ AI risk score: [score]
✅ Funding goal reasonability: passed
📝 Creating governance proposal...
✅ Proposal #[X] created
```

---

### Phase 4: Governance Voting ✅ Ready
**Test:** Community voting on business approval

**Steps:**
1. Go to **"Governance"** page
2. Find your business proposal (Type: Business Approval)
3. Click **"View Details"**
4. Review attestations (6 verification checks)
5. Click **"Vote For"** or **"Vote Against"**
6. Confirm in Freighter wallet
7. ✅ **Expected:** Vote recorded on-chain
8. Wait for voting period end (15 minutes)
9. Click **"Finalize Proposal"**
10. ✅ **Expected:** Status changes to "Passed" or "Rejected"

---

### Phase 5: Investment Flow ✅ Ready
**Test:** Token purchase with XLM payment

**Steps:**
1. Create **new investor account** (different email)
2. Complete KYC for investor
3. Connect **different Freighter wallet**
4. Fund wallet with testnet XLM (friendbot)
5. Go to **"Explore Businesses"**
6. Find your approved business (status: Fundraising)
7. Click **"Invest Now"**
8. Enter token amount (e.g., 50 tokens)
9. Send exact XLM amount to escrow wallet via Freighter
10. Copy transaction hash
11. Paste hash and click **"Confirm Investment"**
12. ✅ **Expected:** Tokens transferred to your wallet on-chain
13. Check **"My Investments"** page
14. ✅ **Expected:** Investment appears with on-chain balance

---

## 🔧 Troubleshooting

### If Backend Stops
```powershell
cd D:\Projects\InvestX\backend
node server.js
```

### If Frontend Stops
```powershell
cd D:\Projects\InvestX\frontend
npm start
```

### Check Disk Space Again
```powershell
Get-PSDrive D | Select-Object Free
```

### View Backend Logs
```powershell
Get-Content D:\Projects\InvestX\backend\backend_run.log -Tail 50 -Wait
```

---

## 🌐 Important URLs

- **Frontend:** http://localhost:3000
- **Backend Health:** http://localhost:5000/api/health
- **Stellar Testnet Friendbot:** https://laboratory.stellar.org/#account-creator
- **Stellar Explorer:** https://stellar.expert/explorer/testnet
- **Freighter Wallet:** chrome://extensions/ (must be on TESTNET)

---

## ✅ Pre-Flight Checklist

Before starting tests:
- [ ] Freighter wallet extension installed
- [ ] Freighter set to **Stellar Testnet** (not Mainnet!)
- [ ] Test wallet funded with XLM from friendbot
- [ ] Both servers running (check URLs above)
- [ ] At least 9 GB free space on D: drive

---

## 📊 Success Criteria

✅ **Complete flow is working if:**
1. KYC upload succeeds without `ENOSPC` error
2. Business application with documents succeeds
3. Oracle verification completes and creates proposal
4. Voting works and proposal can be finalized
5. Investment flow completes with on-chain token transfer
6. Portfolio reflects on-chain balances

---

## 🎉 Current Status

**All systems are GO for testing!**

- ✅ Disk space issue fixed (9.21 GB free)
- ✅ Backend server running on port 5000
- ✅ Frontend server running on port 3000
- ✅ Upload directories ready
- ✅ MongoDB connected
- ✅ Stellar smart contracts deployed

**You can now begin end-to-end testing from the frontend!**

---

**Next Steps:**
1. Open http://localhost:3000 in your browser
2. Follow the testing flow above
3. Monitor backend console for logs
4. Report any issues encountered
