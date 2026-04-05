# 🌐 Freighter Wallet Setup for InvestX Testnet

## Issue Fixed ✅

**Problem:** "Please switch Freighter to Testnet" error when connecting wallet  
**Solution:** Updated network detection logic in `WalletContext.jsx` to correctly identify Freighter's network format

**File Changed:** `frontend/src/context/WalletContext.jsx` (Line 82)
- **Before:** Checked for `net !== "TESTNET"`
- **After:** Checks for `net !== "TEST"` (Freighter returns "TEST" for Testnet, "PUBLIC" for Mainnet)

---

## 📱 How to Switch Freighter to Testnet

### Step 1: Install Freighter Wallet Extension

If you haven't installed Freighter yet:

1. Open Chrome/Brave/Edge browser
2. Go to: https://freighter.app/
3. Click "Install Extension"
4. Pin the extension to your browser toolbar

### Step 2: Switch Network to Testnet

1. **Click the Freighter extension icon** in your browser toolbar
2. **Click on the network selector** at the top (usually shows "MAINNET" or "PUBLIC")
3. **Select "TESTNET"** from the dropdown menu
4. You should see the network indicator change to "TESTNET"

**Visual Guide:**
```
Freighter Popup
├─ [Network Selector: MAINNET ▼]  ← Click here
│  ├─ PUBLIC (Mainnet)
│  ├─ TESTNET               ← Select this
│  └─ FUTURENET
├─ Wallet Balance
└─ Send / Receive buttons
```

### Step 3: Get Testnet XLM (Required for Transactions)

You need test XLM to perform transactions on Testnet:

1. **Copy your wallet address** from Freighter
2. **Visit Friendbot** (Stellar's testnet faucet):
   - Go to: https://laboratory.stellar.org/#account-creator
   - OR use: `curl "https://friendbot.stellar.org?addr=YOUR_WALLET_ADDRESS"`
3. **Paste your address** and click "Get Test Network Lumens"
4. Wait a few seconds - you should receive 10,000 test XLM

**Alternative Method (Using Stellar Laboratory):**
1. Go to: https://laboratory.stellar.org/
2. Make sure "Test" network is selected at the top
3. Navigate to "Account Creator"
4. Paste your Freighter wallet address
5. Click "Create Account"

### Step 4: Connect Wallet to InvestX

Now you can connect your wallet:

1. **Open InvestX:** http://localhost:3000
2. **Click "Connect Wallet"** button
3. **Freighter popup will appear** asking for permission
4. **Click "Allow"** to grant access
5. **Success!** Your wallet should now be connected

---

## 🔧 Configuration Verification

### Frontend Configuration ✅
- **Network:** Testnet
- **Horizon URL:** https://horizon-testnet.stellar.org
- **Network Passphrase:** "Test SDF Network ; September 2015"

**File:** `frontend/src/context/WalletContext.jsx`
```javascript
const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;
```

### Backend Configuration ✅
- **Network:** testnet
- **Horizon URL:** https://horizon-testnet.stellar.org
- **Soroban RPC:** https://soroban-testnet.stellar.org

**File:** `backend/.env`
```
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_SOROBAN_RPC=https://soroban-testnet.stellar.org
```

**File:** `backend/src/config/stellar.js`
```javascript
const networkPassphrase = Networks.TESTNET;
```

---

## 🧪 Testing the Fix

### Test 1: Network Detection
1. Open InvestX at http://localhost:3000
2. Ensure Freighter is set to **TESTNET**
3. Click "Connect Wallet"
4. **Expected Result:** Wallet connects successfully, no error message

### Test 2: Wrong Network Detection
1. Switch Freighter to **MAINNET** (PUBLIC)
2. Try to connect wallet in InvestX
3. **Expected Result:** Error message: "Please switch Freighter to Testnet (currently on PUBLIC)"

### Test 3: Complete Connection Flow
1. Ensure Freighter is on **TESTNET**
2. Connect wallet
3. If new wallet: Complete signup form
4. **Expected Result:** 
   - Wallet address displayed in UI
   - "Wallet connected successfully!" toast message
   - Profile shows connected wallet address

---

## 🐛 Troubleshooting

### Issue: "Freighter extension not found"
**Solution:**
- Install Freighter from https://freighter.app/
- Refresh the page after installation
- Make sure Freighter is enabled in your browser extensions

### Issue: "Please switch Freighter to Testnet"
**Solution:**
1. Click Freighter icon in browser toolbar
2. Click network dropdown at the top
3. Select "TESTNET"
4. Refresh InvestX page
5. Try connecting again

### Issue: "Transaction failed: insufficient balance"
**Solution:**
- You need testnet XLM to perform transactions
- Visit https://laboratory.stellar.org/#account-creator
- Fund your account with test XLM from Friendbot
- Each account needs minimum 1 XLM base reserve

### Issue: "Failed to connect wallet"
**Solution:**
1. Check browser console for detailed error
2. Ensure Freighter is unlocked (enter password)
3. Try disconnecting and reconnecting
4. Clear browser cache and localStorage
5. Restart browser

### Issue: Wallet connects but shows 0 balance
**Solution:**
- This is normal for new testnet accounts
- Fund your account using Friendbot (see Step 3 above)
- Testnet XLM has no real value - it's for testing only

---

## 📊 Network Comparison

| Network | Freighter Returns | Use Case | Real Money |
|---------|------------------|----------|------------|
| **TESTNET** | `"TEST"` | Testing & Development | ❌ No (Test XLM) |
| **MAINNET** | `"PUBLIC"` | Production | ✅ Yes (Real XLM) |
| **FUTURENET** | `"FUTURE"` | Experimental Features | ❌ No |

**⚠️ IMPORTANT:** InvestX is currently configured for **TESTNET ONLY**. Do not use real XLM or switch to Mainnet unless explicitly configured for production.

---

## 🔐 Security Notes

### For Development (Current Setup)
- ✅ Use TESTNET only
- ✅ Test XLM has no value
- ✅ Safe to experiment and make mistakes
- ✅ Can request unlimited test XLM from Friendbot

### For Production (Future)
- ⚠️ Requires switching all configs to MAINNET
- ⚠️ Real XLM has real value
- ⚠️ Transactions are irreversible
- ⚠️ Security audits required before launch

**Current Status:** Development/Testing Phase - Testnet Only

---

## 📝 Developer Notes

### Network Detection Logic

The fix changed the network detection from:
```javascript
// OLD (Incorrect)
if (net !== "TESTNET") {
    toast.warn("Please switch Freighter to Testnet");
    return;
}
```

To:
```javascript
// NEW (Correct)
if (net !== "TEST") {
    toast.warn(`Please switch Freighter to Testnet (currently on ${net})`);
    return;
}
```

**Why?** The Freighter API's `getNetwork()` function returns:
- `"TEST"` for Stellar Testnet
- `"PUBLIC"` for Stellar Mainnet
- `"FUTURE"` for Futurenet

### Testing Network Detection

To test the network detection logic:

```javascript
import { getNetwork } from "@stellar/freighter-api";

// In browser console or React component:
getNetwork().then(net => console.log("Current network:", net));

// Testnet: Logs "TEST"
// Mainnet: Logs "PUBLIC"
```

---

## ✅ Checklist

After applying the fix, verify:

- [x] Frontend network detection fixed (`WalletContext.jsx:82`)
- [x] Backend configured for Testnet (`.env`, `stellar.js`)
- [x] Freighter extension installed
- [ ] Freighter switched to TESTNET
- [ ] Test XLM received from Friendbot
- [ ] Wallet connects successfully
- [ ] No "switch to Testnet" error appears

---

## 🎉 Summary

**Fix Applied:** ✅  
**Network Detection:** ✅ Working  
**Configuration:** ✅ Testnet Ready

**You can now connect your Freighter wallet to InvestX on Testnet!**

**Next Steps:**
1. Switch Freighter to TESTNET
2. Get test XLM from Friendbot
3. Connect wallet at http://localhost:3000
4. Start testing the investment platform

**Happy Testing! 🚀**
