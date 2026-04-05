# Stellar Contract Deployment Setup

## ✅ Admin Account Verified

- **Public Address:** `GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP`
- **Network:** Stellar Testnet  
- **Balance:** 10,000 XLM ✓
- **Status:** Ready for deployment

---

## 📦 Soroban Contract Deployment Options

### Option 1: Using Pre-built WASM Contracts (Recommended)
Deploy already-built Soroban contracts without needing Rust installed.

```bash
# Download pre-compiled contracts
# Place in: smart-contracts/soroban-contracts/contracts/

# Then deploy using stellar-cli or JavaScript
npm run deploy:stellar
```

### Option 2: Build from Rust Source (Advanced)
Build Soroban contracts from Rust source code.

**Prerequisites:**
- Rust toolchain
- stellar-cli installed
- wasm32 target: `rustup target add wasm32-unknown-unknown`

```bash
# Build token contract
cd smart-contracts/soroban-contracts/token-contract
cargo build --target wasm32-unknown-unknown --release

# Build dividend contract
cd ../dividend-contract
cargo build --target wasm32-unknown-unknown --release
```

---

## 🚀 Deploy Contracts Using stellar-cli

### 1. Install stellar-cli
```bash
# macOS / Linux / WSL
cargo install stellar-cli

# Verify
stellar --version
```

### 2. Setup Network Configuration
```bash
# Add testnet
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# Use testnet
stellar network use testnet
```

### 3. Import Admin Account
```bash
# Add admin keypair to stellar-cli
stellar keys generate admin

# Or import existing
stellar keys fund admin
```

### 4. Deploy INVX Token Contract
```bash
stellar contract deploy \
  --source admin \
  --network testnet \
  --wasm smart-contracts/soroban-contracts/token-contract/target/wasm32-unknown-unknown/release/invx_token_contract.wasm

# Output will be the contract ID
# Example: CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Save output as `INVX_TOKEN_CONTRACT_ID` in `.env`

### 5. Deploy Dividend Distributor
```bash
stellar contract deploy \
  --source admin \
  --network testnet \
  --wasm smart-contracts/soroban-contracts/dividend-contract/target/wasm32-unknown-unknown/release/dividend_distributor_contract.wasm

# Save as `DIVIDEND_CONTRACT_ID` in `.env`
```

---

## 📝 Update Environment Variables

After deployment, update `backend/.env`:

```env
# Deployed Contract Addresses
INVX_TOKEN_CONTRACT_ID=CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
DIVIDEND_CONTRACT_ID=CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Stellar Configuration
STELLAR_ADMIN_PUBLIC_ADDRESS=GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP
STELLAR_ADMIN_SECRET=SA7MNPMAVUBV3FF7NY6BB7HW2QD4ZMYGYUUJ6IASETNSMIIQ4HR24KKI
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_SOROBAN_RPC=https://soroban-testnet.stellar.org
```

---

## 🔍 Verify Deployment

### Check Contract on Stellar Expert
Visit: `https://stellar.expert/explorer/testnet/asset/CONTRACT_ADDRESS`

### Initialize Contract
```bash
stellar contract invoke \
  --source admin \
  --network testnet \
  --id CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
  --operation initialize \
  -- \
  --admin GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP \
  --symbol INVX \
  --decimals 7
```

### Set Minter
```bash
stellar contract invoke \
  --source admin \
  --network testnet \
  --id CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
  --operation set_minter \
  -- \
  --minter CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 📊 Contract Functions

### INVX Token Contract

**Initialize:**
```bash
stellar contract invoke \
  --source admin \
  --network testnet \
  --id TOKEN_CONTRACT_ID \
  --operation initialize \
  -- \
  --admin GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP \
  --symbol INVX \
  --decimals 7
```

**Mint Tokens:**
```bash
stellar contract invoke \
  --source admin \
  --network testnet \
  --id TOKEN_CONTRACT_ID \
  --operation mint \
  -- \
  --to GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP \
  --amount 1000000000
```

**Check Balance:**
```bash
stellar contract invoke \
  --source admin \
  --network testnet \
  --id TOKEN_CONTRACT_ID \
  --operation balance \
  -- \
  --id GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP
```

---

## 🧪 JavaScript Contract Invocation

```javascript
const StellarSdk = require('stellar-sdk');

const contractId = 'CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const admin = 'GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP';

// Call contract function
const result = await stellarService.invokeContract(contractId, 'balance', [
  StellarSdk.nativeToScVal(admin)
]);

console.log('Balance:', result);
```

---

## 📋 Deployment Checklist

- [ ] Install stellar-cli
- [ ] Setup network configuration
- [ ] Import admin keypair
- [ ] Build INVX token contract (or download pre-built)
- [ ] Deploy INVX token contract
- [ ] Record contract ID in .env
- [ ] Initialize token contract
- [ ] Build dividend contract (or download pre-built)
- [ ] Deploy dividend contract  
- [ ] Record contract ID in .env
- [ ] Initialize dividend contract
- [ ] Test mint operation
- [ ] Verify on Stellar Expert

---

## 🔗 Useful Resources

- **Stellar CLI Docs:** https://github.com/stellar/stellar-cli
- **Soroban Docs:** https://soroban.stellar.org/
- **Stellar Expert:** https://stellar.expert/explorer/testnet
- **Friendbot:** https://friendbot.stellar.org

---

## ⚠️ Important Notes

1. **Admin Account:** GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP already exists with 10,000 XLM
2. **Testnet Only:** All deployments are on Stellar Testnet
3. **Secret Key:** Keep STELLAR_ADMIN_SECRET secure
4. **Contract IDs:** Are persistent once deployed
5. **Fees:** Minimal (base fee = 100 stroops ≈ $0.000001)

---

**Status:** ✅ Ready for deployment  
**Admin Account Balance:** 10,000 XLM ✓  
**Next Step:** Deploy Soroban contracts or use Option 2 to build from source
