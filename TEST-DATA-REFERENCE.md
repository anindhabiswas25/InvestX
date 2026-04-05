# InvestX - Test Data Reference

## Quick Test Credentials

### Business Owner Account
```
Email: owner@test.com
Password: Test@123
Role: Business Owner
```

### Investor Account
```
Email: investor@test.com
Password: Test@123
Role: Investor
```

### Additional Test Accounts (for multi-wallet voting)
```
Voter 1: voter1@test.com / Test@123
Voter 2: voter2@test.com / Test@123
Voter 3: voter3@test.com / Test@123
```

---

## KYC Test Data

### Valid Aadhaar Numbers (12 digits)
```
123456789012
234567890123
345678901234
```

### Valid PAN Numbers (Format: ABCDE1234F)
```
ABCDE1234F
BCDEF2345G
CDEFG3456H
DEFGH4567I
```

---

## Business Application Test Data

### Sample Business 1: TechCafe Mumbai
```
Name: TechCafe Mumbai
Category: Food & Beverage
Description: A modern cafe serving premium coffee and snacks in Mumbai
Years in Operation: 2
Address: 123 MG Road
City: Mumbai
State: Maharashtra
Pincode: 400001
GST Number: 27AAPFU0939F1ZV
Monthly Revenue: 500000 (₹5 Lakh)
Profit Margin: 25
Funding Goal: 1000000 (₹10 Lakh)
Token Price: 100 (₹100)
Token Name: TechCafe Token
Token Symbol: TECH
Revenue Share %: 20
Duration: 24 months
```

### Sample Business 2: EcoClean Services
```
Name: EcoClean Services
Category: Services
Description: Eco-friendly cleaning services for homes and offices
Years in Operation: 3
Address: 45 Park Street
City: Bangalore
State: Karnataka
Pincode: 560001
GST Number: 29AABCU9603R1ZX
Monthly Revenue: 750000 (₹7.5 Lakh)
Profit Margin: 30
Funding Goal: 2000000 (₹20 Lakh)
Token Price: 200 (₹200)
Token Name: EcoClean Token
Token Symbol: ECO
Revenue Share %: 25
Duration: 36 months
```

### Sample Business 3: FitLife Gym
```
Name: FitLife Gym
Category: Health & Fitness
Description: Modern fitness center with state-of-the-art equipment
Years in Operation: 1
Address: 78 Sports Complex
City: Delhi
State: Delhi
Pincode: 110001
GST Number: 07AABCU9603R1ZY
Monthly Revenue: 400000 (₹4 Lakh)
Profit Margin: 35
Funding Goal: 1500000 (₹15 Lakh)
Token Price: 150 (₹150)
Token Name: FitLife Token
Token Symbol: FIT
Revenue Share %: 22
Duration: 30 months
```

---

## Valid GST Numbers (State-wise)

```
Maharashtra (27): 27AAPFU0939F1ZV
Karnataka (29): 29AABCU9603R1ZX
Delhi (07): 07AABCU9603R1ZY
Gujarat (24): 24AABCU9603R1ZZ
Tamil Nadu (33): 33AABCU9603R1ZA
```

---

## Investment Test Data

### Small Investment
```
Token Amount: 10
Expected Value: ₹1,000 (at ₹100/token)
Expected XLM: ~12.5 XLM (at 80 INR/XLM rate)
```

### Medium Investment
```
Token Amount: 50
Expected Value: ₹5,000
Expected XLM: ~62.5 XLM
```

### Large Investment
```
Token Amount: 100
Expected Value: ₹10,000
Expected XLM: ~125 XLM
```

---

## Stellar Testnet Wallets

### Create New Test Wallets
1. Install Freighter extension
2. Create new wallet (save secret key!)
3. Switch to Testnet
4. Fund via Friendbot: https://laboratory.stellar.org/#account-creator

### Admin Wallet (from .env)
```
Public: GAK5LEBNBCHHIEKJY5HU7GTYBBUCXFP4BYFK2SDPRN55FWR3VQXQ3DNN
Network: Stellar Testnet
```

---

## Contract Addresses (from .env)

```
Governance: CDDGMY65YWEXY3IRI7UWO27N3W456RWWSUVQ44YHTNYTFYSGUDRMVBJH
Document Registry: CAIE2RAQSPRSEAE6T2QAFLLCVKHBGGNLNWT2W3VWAEFCRM6ZLN4NCULJ
Escrow: CDQJFA7FWAFENCOBGYI5YTEIIIV2JWYWGPKMFTSKZCS3GVSVPSVDULXU
Dividend: CDH35PFTCU2WXPQ3LW4NFDJADNCEKK7RNH2UUNH5JRKFZ7O7U3UCFY6C
Business Token: CAVH3JASVQT5YZY2NRCYXIIJ6IJYSKCHWMAN5E3CKCBBNKDTTRHM75UW
```

---

## Test Images/Documents

### For KYC Selfie
- Use any JPEG/PNG image < 5MB
- Example: Take a screenshot and save as selfie.jpg

### For Business Documents
- GST Certificate (PDF or image)
- Bank Statement (PDF or image)
- Business License (PDF or image)
- PAN Card (PDF or image)

### For Business Photos
- Storefront photo
- Interior photo
- Product/service photo
- Team photo

---

## Expected Timings

```
KYC Auto-Verification: ~5 seconds
Business Verification Start: ~3 seconds after submission
Oracle Verification Complete: ~10-15 seconds
Proposal Auto-Creation: Immediate after verification
Voting Duration: 15 minutes (test mode)
Token Transfer: 5-10 seconds (blockchain confirmation)
```

---

## Governance Voting Requirements

```
Minimum Voters (Quorum): 3
Approval Threshold: 60%
Voting Duration: 15 minutes (900 seconds)
Vote Weight: 1 per wallet (equal voting)
```

---

## Investment Limits

```
Minimum Investment: ₹1,000 (MIN_INVESTMENT_INR)
Maximum Investment per Business: ₹1,00,000 (MAX_INVESTMENT_INR)
XLM/INR Rate: 80 (hardcoded for testing)
```

---

## Status Flow

### Business Status Progression
```
pending → verifying → vote_required → voting → approved/rejected
→ fundraising (if approved) → funded → active
```

### KYC Status
```
pending → verified/rejected
```

### Proposal Status
```
active → passed/rejected → executed
```

---

## Quick Terminal Commands

### Check Disk Space
```powershell
Get-PSDrive D
```

### View Backend Logs
```powershell
Get-Content D:\Projects\InvestX\backend\backend_run.log -Tail 50 -Wait
```

### Check Uploaded Files
```powershell
Get-ChildItem D:\Projects\InvestX\backend\uploads -Recurse
```

### Check Server Status
```powershell
Test-NetConnection localhost -Port 5000
Test-NetConnection localhost -Port 3000
```

### Restart Backend
```powershell
cd D:\Projects\InvestX\backend
node server.js
```

### Restart Frontend
```powershell
cd D:\Projects\InvestX\frontend
npm start
```

---

## API Endpoints Reference

```
POST /api/auth/register - Register new user
POST /api/auth/login - Login
GET /api/users/profile - Get user profile
PUT /api/users/wallet - Update wallet address
POST /api/users/kyc - Submit KYC
POST /api/businesses/apply - Submit business application
GET /api/businesses - Get all businesses
GET /api/businesses/:id - Get business details
GET /api/governance/proposals - Get all proposals
GET /api/governance/proposals/active - Get active proposals
POST /api/governance/proposals/:id/vote - Submit vote
POST /api/governance/proposals/:id/finalize - Finalize proposal
POST /api/investments/initiate - Initiate investment
POST /api/investments/confirm - Confirm investment
GET /api/investments/my-investments - Get my portfolio
```

---

## Browser Console Useful Commands

```javascript
// Check localStorage
localStorage.getItem('token')

// Check wallet connection
window.freighterApi

// Clear all data
localStorage.clear()
```

---

This reference file contains all the test data you'll need for comprehensive end-to-end testing!
