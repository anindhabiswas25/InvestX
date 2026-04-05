# 🌟 Stellar Setup - Command Reference

## ✅ Current Status

```
Admin Account:     GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP
Network:           Stellar Testnet
Balance:           10,000 XLM ✓
Backend Setup:     ✅ Complete
Contracts Ready:   ✅ Ready for deployment
```

---

## 🚀 Quick Start Commands

### 1. Verify Admin Account
```bash
cd backend
npm run stellar:verify
```
Expected: Admin account exists with 10,000 XLM

### 2. Deploy All Contracts
```bash
cd smart-contracts
npm run deploy:stellar all
```
This will:
- Setup stellar-cli network
- Deploy token contract
- Deploy dividend contract
- Update .env with contract IDs

### 3. Verify Deployment
```bash
# Check that contract IDs were saved to .env
cat backend/.env | grep CONTRACT_ID

# View on Stellar Expert
# https://stellar.expert/explorer/testnet/asset/INVX_TOKEN_CONTRACT_ID
```

---

## 📁 Project Structure

```
InvestX/
├── backend/
│   ├── .env                            ← Contains admin address & secret
│   ├── src/
│   │   ├── config/stellar.js          ← Stellar SDK configuration
│   │   ├── services/stellar.service.js ← Blockchain operations
│   │   └── scripts/initializeStellarAccounts.js
│   └── package.json
├── smart-contracts/
│   ├── scripts/
│   │   ├── deployStellar.js
│   │   └── deployStellarContracts.js  ← Main deployment script
│   ├── soroban-contracts/
│   │   ├── token-contract/
│   │   │   ├── Cargo.toml
│   │   │   └── src/lib.rs
│   │   └── dividend-contract/
│   │       ├── Cargo.toml
│   │       └── src/lib.rs
│   └── package.json
└── docs/
    ├── STELLAR-MIGRATION-GUIDE.md      ← Complete migration reference
    ├── STELLAR-QUICKSTART.md           ← 5-minute setup
    ├── STELLAR-DEPLOYMENT-SETUP.md     ← Deployment instructions
    ├── SOROBAN-SETUP.md                ← Smart contract development
    └── BLOCKCHAIN-MIGRATION-SUMMARY.md ← Migration overview
```

---

## 🎯 Development Commands

### Backend Commands

```bash
cd backend

# Verify admin account
npm run stellar:verify

# Interactive account management
npm run stellar:init-accounts

# Fund a test account
npm run stellar:fund <public_key> <amount>

# Start development server
npm run dev

# Run tests
npm test
```

### Smart Contracts Commands

```bash
cd smart-contracts

# Install dependencies
npm install

# Deploy all contracts
npm run deploy:stellar all

# Deploy token contract only
npm run deploy:stellar:token

# Deploy dividend contract only
npm run deploy:stellar:dividend

# Initialize contract (after deployment)
npm run deploy:stellar init <contract_id>
```

---

## 🔑 Configuration Files

### backend/.env
```env
# Stellar Configuration
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_ADMIN_PUBLIC_ADDRESS=GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP
STELLAR_ADMIN_SECRET=SA7MNPMAVUBV3FF7NY6BB7HW2QD4ZMYGYUUJ6IASETNSMIIQ4HR24KKI
STELLAR_SOROBAN_RPC=https://soroban-testnet.stellar.org

# After contract deployment
INVX_TOKEN_CONTRACT_ID=CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
DIVIDEND_CONTRACT_ID=CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### backend/src/config/stellar.js
- Stellar SDK initialization
- Network configuration
- Admin account setup

### backend/src/services/stellar.service.js
- XLM transfers
- Escrow operations
- Account management
- Transaction history

---

## 💻 JavaScript API Usage

### Import Service
```javascript
const stellar = require('./src/services/stellar.service');
```

### Transfer XLM to Investor
```javascript
const result = await stellar.transferXLM(
  'GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP',
  100,  // 100 XLM
  'Investment payment' // memo
);
console.log('TX Hash:', result.txHash);
```

### Check Balance
```javascript
const balance = await stellar.getXLMBalance(
  'GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP'
);
console.log(`Balance: ${balance} XLM`);
```

### Escrow: Deposit Funds
```javascript
const deposit = await stellar.escrowDeposit(
  'business_123',                    // Business ID
  'GB3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKQ', // Investor
  500   // 500 XLM to hold
);
console.log('Escrow ID:', deposit.escrowId);
```

### Escrow: Release to Business
```javascript
const release = await stellar.escrowReleaseToBusiness(
  'business_123',
  'GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP',
  500
);
console.log('Released:', release.txHash);
```

### Escrow: Refund Investor
```javascript
const refund = await stellar.escrowRefundInvestor(
  'business_123',
  'GB3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKQ',
  500
);
console.log('Refunded:', refund.txHash);
```

### Get All Balances
```javascript
const balances = await stellar.getAllBalances(
  'GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP'
);
/*
[
  { asset: 'XLM', balance: 10000, issuer: 'native' },
  { asset: 'INVX', balance: 1000, issuer: 'CDxxxxxx...' }
]
*/
```

### Get Transaction History
```javascript
const txs = await stellar.getTransactionHistory(
  'GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP',
  10  // Last 10 transactions
);
txs.forEach(tx => {
  console.log(`${tx.type}: ${tx.amount || 'N/A'} - ${tx.createdAt}`);
});
```

---

## 🌐 URLs & Resources

### Admin Account
- **Address:** GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP
- **Explorer:** https://stellar.expert/explorer/testnet/account/GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP
- **Horizon:** https://horizon-testnet.stellar.org/accounts/GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP

### Contract Deployment
- After deployment, contracts will be at: 
  - `https://stellar.expert/explorer/testnet/contract/CDXXXXXXXXXXXXXXX...`

### Documentation
- Stellar Docs: https://developers.stellar.org/
- Soroban Docs: https://soroban.stellar.org/docs
- Testnet Faucet: https://friendbot.stellar.org

---

## 🧪 Test Scenarios

### Test 1: Send XLM to Investor
```bash
# 1. Get investor address
INVESTOR_ADDR="GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP"

# 2. Send XLM
npm run stellar:fund $INVESTOR_ADDR 50

# 3. Verify receipt (on Stellar Expert or via API)
```

### Test 2: Complete Escrow Flow
```javascript
const businessId = 'test_business_001';
const investorAddress = 'GA...';
const amount = 100; // 100 XLM

// 1. Deposit to escrow
const d = await stellar.escrowDeposit(businessId, investorAddress, amount);
console.log('Escrowed:', d.escrowId);

// 2. Release to business (after verification)
const rel = await stellar.escrowReleaseToBusiness(businessId, 'GA...', amount);
console.log('Released:', rel.txHash);
```

### Test 3: Check Token Balance (After Contract Deployment)
```javascript
const balance = await stellar.getAssetBalance(
  'GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP',
  'INVX',
  'CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
);
console.log(`INVX Balance: ${balance}`);
```

---

## ⚠️ Important Notes

1. **Secret Key Security:** The STELLAR_ADMIN_SECRET should be kept secure and never committed to git
2. **Testnet Only:** All current configuration is for Stellar Testnet
3. **Base Fees:** Stellar uses 100 stroops base fee (~$0.000001 per transaction)
4. **Memos:** Always include meaningful memos for transactions (helps with tracking)
5. **Trustlines:** Accounts must establish trustlines for custom assets (INVX) before receiving them

---

## 📊 Admin Account Summary

| Detail | Value |
|--------|-------|
| Public Address | GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP |
| Secret Key | SA7MNPMAVUBV3FF7NY6BB7HW2QD4ZMYGYUUJ6IASETNSMIIQ4HR24KKI |
| Network | Stellar Testnet |
| Base Fee | 100 stroops |
| XLM Balance | 10,000 XLM ✓ |
| Status | ✅ Active |
| Created | March 30, 2026 |

---

## 🔄 Workflow

```
1. VERIFY ACCOUNT
   └─ npm run stellar:verify
      ✓ Confirms admin account exists
      ✓ Shows current XLM balance

2. DEPLOY CONTRACTS  
   └─ npm run deploy:stellar all
      ✓ Deploys INVX token contract
      ✓ Deploys dividend distributor
      ✓ Updates .env with contract IDs

3. INITIALIZE CONTRACTS
   └─ Setup contract state
      ✓ Set admin/owner
      ✓ Setup minters/distributors

4. INTEGRATE WITH BACKEND
   └─ Update controllers
      ✓ Use stellar.service.js
      ✓ Handle XLM transfers
      ✓ Manage escrow

5. TEST END-TO-END
   └─ Run full investment flows
      ✓ Deposit → Escrow → Release
      ✓ Token transfers
      ✓ Dividend distribution

6. GO LIVE (Mainnet Later)
   └─ Update RPC URLs & addresses
      ✓ Stellar Mainnet
      ✓ Production contracts
      ✓ Real XLM usage
```

---

**Setup Complete! ✅**

Ready to deploy contracts? Follow the deployment instructions in `STELLAR-DEPLOYMENT-SETUP.md`

For questions, reference the complete guide in `STELLAR-MIGRATION-GUIDE.md`
