# Stellar Integration - Quick Start Guide

## 5-Minute Setup

### Step 1: Update Environment Variables
```bash
# Edit backend/.env
STELLAR_ADMIN_PUBLIC_ADDRESS=GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP
STELLAR_ADMIN_SECRET=SA7MNPMAVUBV3FF7NY6BB7HW2QD4ZMYGYUUJ6IASETNSMIIQ4HR24KKI
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

### Step 2: Install Dependencies
```bash
cd backend
npm install
```

### Step 3: Verify Admin Account
```bash
npm run stellar:verify
```

Expected output:
```
✓ Admin account exists
✓ Admin XLM Balance: 100.0 XLM
✓ Admin keypair configured
```

### Step 4: Create & Fund Test Accounts
```bash
# Generate new keypair (Stellar)
node -e "
const sdk = require('stellar-sdk');
const kp = sdk.Keypair.random();
console.log('Public:', kp.publicKey());
console.log('Secret:', kp.secret());
"

# Fund via Friendbot (only on testnet)
curl "https://friendbot.stellar.org?addr=GDVGCNPYED7FFJ65MAGEP2V7B4HVLJ5HXQQNQE7KSXTDDBMX3LSP2EEB"

# Or use admin wallet
npm run stellar:fund GDVGCNPYED7FFJ65MAGEP2V7B4HVLJ5HXQQNQE7KSXTDDBMX3LSP2EEB 50
```

---

## Basic Commands

| Command | Purpose |
|---------|---------|
| `npm run stellar:verify` | Check admin account status |
| `npm run stellar:init-accounts` | Interactive account setup wizard |
| `npm run stellar:fund <address> <amount>` | Send XLM from admin wallet |

---

## Common Tasks

### ✓ Send XLM to Investor
```javascript
const stellar = require('./backend/src/services/stellar.service');

await stellar.transferXLM(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Recipient
  100, // Amount in XLM
  'Payment for investment' // Memo
);
```

### ✓ Check Account Balance
```javascript
const balance = await stellar.getXLMBalance(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
);
console.log(`Balance: ${balance} XLM`);
```

### ✓ Setup Escrow
```javascript
// Deposit
await stellar.escrowDeposit(
  'business123',
  'investor_address',
  500 // XLM to hold
);

// Release to business
await stellar.escrowReleaseToBusiness(
  'business123',
  'business_wallet',
  500
);
```

---

## Key Differences from Celo

| Feature | Celo | Stellar |
|---------|------|---------|
| **Provider** | ethers.JsonRpcProvider | StellarSdk.Server |
| **Wallet** | ethers.Wallet | StellarSdk.Keypair |
| **Balance** | ethers.formatEther() | string parsing |
| **Transfer** | contract.transfer() | Operation.payment() |
| **Fees** | Gas (wei) | stroops (100 stroops = $0.00001 XLM) |

---

## Testnet Faucet

Get free XLM for testing:
```bash
# Method 1: Friendbot (automatic)
curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"

# Method 2: Use admin wallet
npm run stellar:fund YOUR_PUBLIC_KEY 100
```

---

## Stellar Explorer

View transactions and accounts:
- **Testnet:** https://stellar.expert/explorer/testnet
- **Check Admin:** https://stellar.expert/explorer/testnet/account/GDVGCNPYED7FFJ65MAGEP2V7B4HVLJ5HXQQNQE7KSXTDDBMX3LSP2EEB

---

## Next Steps

1. ✓ Set up admin account
2. ✓ Create test investor accounts
3. ✓ Test XLM transfers
4. ✓ Implement business token logic (Soroban)
5. ✓ Deploy dividend distributor
6. ✓ Test end-to-end flows

See [STELLAR-MIGRATION-GUIDE.md](./STELLAR-MIGRATION-GUIDE.md) for detailed setup.
