# Soroban Smart Contracts Setup

## Overview
Soroban is Stellar's smart contract platform using **Rust** (not Solidity). This guide covers building and deploying INVX smart contracts on Stellar Testnet.

**Admin Address:** `GA3QI2KH7TRB75QF2PKKWO3EXFCBMTJJX3KBYL7KPXSCCM4AS5AIIGKP`

---

## Prerequisites

### 1. Install Rust
```bash
# macOS, Linux, or WSL
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Verify
rustc --version
cargo --version
```

### 2. Setup Stellar CLI
```bash
# Install stellar-cli
cargo install stellar-cli

# Verify
stellar --version
```

### 3. Add Wasm Target
```bash
rustup target add wasm32-unknown-unknown
```

### 4. Configure Stellar CLI
```bash
# Add testnet network
stellar network add testnet --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# Configure admin account
stellar keys generate admin

# Or import existing keypair
stellar keys fund admin --network testnet
```

---

## Project Structure

```
smart-contracts/soroban-contracts/
├── token-contract/
│   ├── Cargo.toml          # Rust manifest
│   └── src/
│       └── lib.rs          # INVX Token contract
├── dividend-contract/
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs          # Dividend Distributor
└── README.md
```

---

## Building Contracts

### Build INVX Token Contract
```bash
cd smart-contracts/soroban-contracts/token-contract

# Build for Wasm
cargo build --target wasm32-unknown-unknown --release

# Output: target/wasm32-unknown-unknown/release/invx_token_contract.wasm
```

### Build All Contracts
```bash
cd smart-contracts/soroban-contracts

# Build token contract
cd token-contract && cargo build --target wasm32-unknown-unknown --release && cd ..

# Build dividend contract  
cd dividend-contract && cargo build --target wasm32-unknown-unknown --release && cd ..
```

---

## Deploying Contracts

### Deploy INVX Token Contract
```bash
stellar contract deploy \
  --source admin \
  --network testnet \
  --wasm smart-contracts/soroban-contracts/token-contract/target/wasm32-unknown-unknown/release/invx_token_contract.wasm

# Output: CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# Save this as INVX_CONTRACT_ADDRESS in .env
```

### Deploy Dividend Distributor
```bash
stellar contract deploy \
  --source admin \
  --network testnet \
  --wasm smart-contracts/soroban-contracts/dividend-contract/target/wasm32-unknown-unknown/release/dividend_distributor.wasm

# Output: CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  
# Save as DIVIDEND_CONTRACT_ADDRESS in .env
```

---

## Contract Interactions

### Invoke Contract Functions

#### Initialize Token
```bash
stellar contract invoke \
  --source admin \
  --network testnet \
  --id CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
  --operation initialize \
  -- \
  --admin GDVGCNPYED7FFJ65MAGEP2V7B4HVLJ5HXQQNQE7KSXTDDBMX3LSP2EEB \
  --symbol INVX \
  --decimals 7
```

#### Mint Tokens
```bash
stellar contract invoke \
  --source admin \
  --network testnet \
  --id CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
  --operation mint \
  -- \
  --to GDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
  --amount 1000000 # 1M INVX (with 7 decimals)
```

#### Check Balance
```bash
stellar contract invoke \
  --source admin \
  --network testnet \
  --id CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
  --operation balance \
  -- \
  --id GDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## JavaScript Integration

### Call Soroban Contract from Node.js

```javascript
const { Server, Keypair, Account, TransactionBuilder } = require('stellar-sdk');
const { SorobanRpc } = require('@stellar/stellar-sdk');

const server = new Server('https://soroban-testnet.stellar.org');
const rpc = new SorobanRpc.Server('https://soroban-testnet.stellar.org');

// Load contract
const contractId = 'CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

// Invoke contract function
async function invokeContractFunction() {
  const result = await rpc.invokeContractFunction(
    contractId,
    'balance',
    [/* args */]
  );
  return result;
}
```

---

## Best Practices

### 1. Security
- ✓ Always validate input parameters
- ✓ Use proper access controls (admin checks)
- ✓ Handle overflow/underflow

```rust
require!(amount > 0, "Amount must be positive");
require!(msg.sender == admin, "Unauthorized");
```

### 2. Gas Optimization  
- ✓ Minimize storage writes
- ✓ Use efficient data structures
- ✓ Batch operations

### 3. Testing
```bash
# Run Rust tests
cargo test

# Test with soroban-cli
stellar contract invoke --dry-run ...
```

### 4. Documentation
```rust
/// Mint new INVX tokens
/// 
/// # Arguments
/// * `to` - Recipient address
/// * `amount` - Amount in stroops
pub fn mint(env: Env, to: Address, amount: i128) {
  // Implementation
}
```

---

## Common Patterns

### Token Transfer
```rust
pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
    from.require_auth();
    
    // Check balance
    let balance = get_balance(&env, &from);
    require!(balance >= amount, "Insufficient balance");
    
    // Update balances
    set_balance(&env, &from, balance - amount);
    set_balance(&env, &to, get_balance(&env, &to) + amount);
}
```

### Access Control
```rust
fn check_admin(env: &Env, admin: &Address) {
    let current_admin = env.storage().instance().get::<Address>("admin");
    require!(current_admin == Some(admin), "Unauthorized");
}
```

### Storage Operations
```rust
// Write
env.storage().instance().set::<Symbol, i128>(
    &Symbol::short("balance"),
    &amount
);

// Read
let balance: i128 = env.storage()
    .instance()
    .get(&Symbol::short("balance"))
    .unwrap_or(0);
```

---

## Troubleshooting

### Error: "No such file or directory: wasm32-unknown-unknown/release"
**Solution:** Build the contract first:
```bash
cargo build --target wasm32-unknown-unknown --release
```

### Error: "RPC error: ..."
**Solution:** Verify RPC endpoint and network:
```bash
stellar network list
stellar network use testnet
```

### Error: "Not enough XLM for transaction"
**Solution:** Fund admin account:
```bash
stellar account fund admin
```

### Contract Not Initializing
**Solution:** Call initialize before other operations:
```bash
stellar contract invoke ... --operation initialize
```

---

## Resources

- **Soroban Documentation:** https://soroban.stellar.org/docs
- **Soroban SDK Examples:** https://github.com/stellar/rs-soroban-sdk/tree/main/soroban-sdk/examples
- **Rust Book:** https://doc.rust-lang.org/book/
- **Stellar Developer Docs:** https://developers.stellar.org/

---

## Next Steps

1. [ ] Install Rust and stellar-cli
2. [ ] Build INVX token contract
3. [ ] Deploy token contract to testnet
4. [ ] Build dividend distributor
5. [ ] Deploy dividend contract
6. [ ] Initialize contracts
7. [ ] Test mint/transfer operations
8. [ ] Integrate with backend service

---

**Status:** ✓ Soroban setup complete  
**Network:** Stellar Testnet  
**Admin:** GDVGCNPYED7FFJ65MAGEP2V7B4HVLJ5HXQQNQE7KSXTDDBMX3LSP2EEB
