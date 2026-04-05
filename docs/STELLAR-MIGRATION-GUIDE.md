# Stellar Blockchain Migration Guide

## Overview
InvestX has been migrated from the Celo blockchain to the Stellar blockchain. This guide covers the key changes, setup instructions, and deployment procedures.

**Migration Date:** March 30, 2026  
**Admin Address:** `GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP`  
**Native Currency:** XLM (Stellar Lumens, replacing CELO)  
**Target Network:** Stellar Testnet

---

## Key Changes

### Blockchain Architecture
| Aspect | Celo (Old) | Stellar (New) |
|--------|-----------|-------------|
| **VM Type** | EVM (Ethereum Virtual Machine) | Non-EVM (Native Stellar) |
| **Smart Contracts** | Solidity (.sol) | Soroban (Rust) |
| **Native Currency** | CELO | XLM (Stellar Lumens) |
| **Transaction Model** | Gas-based | Fee-based (100 stroops = 0.0000001 XLM) |
| **Contract Type** | Deployed instances | Account-based or Soroban |

### Code Changes

#### 1. Configuration Files
- **Old:** `backend/src/config/celo.js` (ethers.js + EVM)
- **New:** `backend/src/config/stellar.js` (stellar-sdk)

**Environment Variables Updated:**
```env
# Old (Celo)
CELO_NETWORK=alfajores
CELO_RPC_URL=...
CELO_CHAIN_ID=44787
ADMIN_WALLET_PRIVATE_KEY=0x...

# New (Stellar)
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_ADMIN_PUBLIC_ADDRESS=GDVGCNPYED7FFJ65MAGEP2V7B4HVLJ5HXQQNQE7KSXTDDBMX3LSP2EEB
STELLAR_ADMIN_SECRET=SB...
STELLAR_SOROBAN_RPC=https://soroban-testnet.stellar.org
```

#### 2. Service Layer
- **Old:** `backend/src/services/celo.service.js`
- **New:** `backend/src/services/stellar.service.js`

**Key API Differences:**
```javascript
// Celo (ethers.js)
const balance = await provider.getBalance(address);
const tx = await contract.transfer(to, amount);

// Stellar (stellar-sdk)
const account = await server.loadAccount(address);
const xlmBalance = account.balances[0].balance;
const tx = await buildAndSubmitTx(keypair, builder => builder.addOperation(...));
```

#### 3. Smart Contracts
- **Old:** Solidity ERC-20 and custom contracts
- **New:** Soroban (Rust) contracts in `smart-contracts/soroban-contracts/`

---

## Setup Instructions

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Smart Contracts
cd smart-contracts
npm install
```

**Key New Dependency:**
```json
{
  "stellar-sdk": "^12.0.0"
}
```

### 2. Environment Configuration

**Copy and configure `.env` file** (`backend/.env`):

```env
# Copy from .env.example
cp backend/.env.example backend/.env

# Then edit with your values:
STELLAR_NETWORK=testnet
STELLAR_ADMIN_PUBLIC_ADDRESS=GDVGCNPYED7FFJ65MAGEP2V7B4HVLJ5HXQQNQE7KSXTDDBMX3LSP2EEB
STELLAR_ADMIN_SECRET=<your-secret-key-starting-with-SB>
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_SOROBAN_RPC=https://soroban-testnet.stellar.org
```

### 3. Initialize Stellar Accounts

#### Check Admin Account Status
```bash
npm run stellar:verify
```

This will:
- ✓ Load the admin account from Stellar Testnet
- ✓ Check XLM balance
- ✓ Verify keypair configuration

#### Fund Test Accounts
To create a new test account with XLM:

```bash
# Interactive mode
npm run stellar:init-accounts

# Or direct command
npm run stellar:fund <public-address> <amount>

# Examples:
npm run stellar:fund GBZRH43RRFQR6LZLQ3JXJVQHWM5RVW55JNVTZ5WRMDHVQKDLQQ2QN5R 100
```

**Note:** New accounts can be funded via **Friendbot** on testnet:
```bash
curl "https://friendbot.stellar.org?addr=ACCOUNT_PUBLIC_ADDRESS"
```

---

## Stellar Blockchain Basics

### Account Model
Unlike Ethereum (which uses contracts), Stellar uses **accounts as the fundamental unit**:

```javascript
// Stellar account structure
{
  id: "GDVGCNPYED7FFJ65MAGEP2V7B4HVLJ5HXQQNQE7KSXTDDBMX3LSP2EEB",
  balances: [
    { asset: "XLM", balance: "100.0" },
    { asset: "INVX", balance: "50.0" }
  ],
  sequence: "12345678",
  signers: [...]
}
```

### Key Concepts

#### 1. **XLM (Stellar Lumens)**
- Native currency of Stellar
- Used for transaction fees and trust setup
- 1 stroops = 0.0000001 XLM

#### 2. **Assets**
- Custom tokens (like INVX) are **issued assets**
- Requires **trustline** setup before receiving

```javascript
// Trustline setup
const tx = new StellarSdk.TransactionBuilder(account, {...})
  .addOperation(
    StellarSdk.Operation.changeTrust({
      asset: new StellarSdk.Asset('INVX', ISSUER),
      limit: '1000000000'
    })
  )
  .build();
```

#### 3. **Transactions**
- Built using **TransactionBuilder**
- Signed using keypair
- Submitted to Horizon API

```javascript
const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
  fee: 100, // stroops
  networkPassphrase: StellarSdk.Networks.TESTNET_NETWORK_PASSPHRASE,
})
  .addOperation(StellarSdk.Operation.payment({...}))
  .build();

tx.sign(keypair);
const result = await server.submitTransaction(tx);
```

---

## Smart Contract Migration (Soroban)

### Solidity → Rust (Soroban)

**This requires a complete rewrite** of smart contracts in Rust using the Soroban SDK.

#### Template Structure

```rust
// File: soroban-contracts/token-contract/src/lib.rs
#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct INVXToken;

#[contractimpl]
impl INVXToken {
    pub fn mint(env: Env, user: Address, amount: i128) {
        // Implementation
    }
}
```

#### Building & Deploying Soroban Contracts

**Prerequisites:**
1. Install Rust: https://www.rust-lang.org/tools/install
2. Install stellar-cli: https://github.com/stellar/rs-soroban-sdk
3. Add Wasm target: `rustup target add wasm32-unknown-unknown`

**Build:**
```bash
cd soroban-contracts/token-contract
cargo build --target wasm32-unknown-unknown
```

**Deploy:**
```bash
soroban contract deploy \
  --source admin \
  --network testnet \
  --wasm ./target/wasm32-unknown-unknown/release/invx_token_contract.wasm
```

**Documentation:** https://soroban.stellar.org/docs

---

## API Reference

### Core Functions

#### Transfer XLM
```javascript
const result = await stellarService.transferXLM(
  recipientAddress,
  xlmAmount,
  memoText
);
// Returns: { txHash, amount, recipient, timestamp }
```

#### Get Balance
```javascript
const xlmBalance = await stellarService.getXLMBalance(publicAddress);
const assetBalance = await stellarService.getAssetBalance(
  publicAddress,
  'INVX',
  ISSUER_ADDRESS
);
```

#### Escrow Operations
```javascript
// Deposit funds for escrow
const deposit = await stellarService.escrowDeposit(
  businessId,
  investorAddress,
  xlmAmount
);

// Release to business
const release = await stellarService.escrowReleaseToBusiness(
  businessId,
  businessWalletAddress,
  xlmAmount
);

// Refund investor
const refund = await stellarService.escrowRefundInvestor(
  businessId,
  investorWalletAddress,
  xlmAmount
);
```

---

## Testing

### Verify Stellar Connection
```bash
node -e "
const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
server.ledgers().limit(1).call()
  .then(() => console.log('✓ Stellar Testnet connected'))
  .catch(err => console.error('✗ Connection failed:', err.message));
"
```

### Check Admin Account
```bash
npm run stellar:verify
```

### Test XLM Transfer
```bash
npm run stellar:fund RECEIVER_PUBLIC_KEY 10
```

---

## Troubleshooting

### Problem: "Account not found (404)"
**Solution:** Create account via Friendbot:
```bash
curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"
```

### Problem: "Invalid STELLAR_ADMIN_SECRET"
**Solution:** 
- Secret key must start with `SB`
- Ensure it's not wrapped with `0x` prefix (that's Ethereum format)
- Verify it matches the admin public address

### Problem: "Operation failed: source_account_missing_signers"
**Solution:** Ensure the signing keypair matches the account that initiated the transaction.

### Problem: "Asset not found"
**Solution:** Account must establish trustline before receiving custom assets:
```javascript
// Build and sign trustline transaction
const trustlineTx = await stellarService.buildTrustlineTx(
  accountAddress,
  'INVX',
  ISSUER_ADDRESS
);
```

---

## Migration Checklist

- [ ] Install `stellar-sdk` in `package.json`
- [ ] Update `.env` with Stellar configuration
- [ ] Initialize admin account with `npm run stellar:verify`
- [ ] Fund test accounts using Friendbot or admin wallet
- [ ] Test XLM transfers: `npm run stellar:fund <address> <amount>`
- [ ] Set up trustlines for custom assets
- [ ] Build Soroban contracts (if using): `npm run soroban:build`
- [ ] Deploy Soroban contracts to testnet
- [ ] Update controller/service files to use `stellar.service.js`
- [ ] Test end-to-end flows
- [ ] Update documentation and API endpoints

---

## Resources

- **Stellar Documentation:** https://developers.stellar.org/
- **Horizon API:** https://developers.stellar.org/api/
- **Soroban SDK:** https://soroban.stellar.org/
- **Stellar Expert (Block Explorer):** https://stellar.expert/explorer/testnet
- **JavaScript SDK:** https://github.com/stellar/py-stellar-base
- **Stellar Testnet Friendbot:** https://friendbot.stellar.org

---

## Support

For questions or issues:
1. Check Stellar documentation: https://developers.stellar.org/
2. Review smart contract examples: https://github.com/stellar/rs-soroban-sdk
3. Test transactions on Stellar Expert: https://stellar.expert/explorer/testnet

---

**Last Updated:** March 30, 2026  
**Version:** 1.0 (Stellar Testnet)
