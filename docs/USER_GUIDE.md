# InvestX — User Guide

Welcome to InvestX — the community-powered fractional investment platform for local businesses, built on the Stellar blockchain.

---

## Quick Start

| I want to… | Go to |
|------------|-------|
| Invest in a business | [Invest as an Investor](#investor-guide) |
| Raise funds for my business | [Raise Funds as a Business Owner](#business-owner-guide) |
| Vote on proposals | [Participate in Governance](#governance--voting) |
| Claim dividends | [Claim Your Earnings](#claiming-dividends) |

---

## Prerequisites

1. **Install Freighter Wallet** — [freighter.app](https://www.freighter.app/)  
   Freighter is the Stellar web wallet extension (available for Chrome, Firefox, Brave).

2. **Switch to Testnet** — Open Freighter → Settings → Network → Select **Testnet**

3. **Fund Your Wallet** — Get free testnet XLM from [Stellar Friendbot](https://friendbot.stellar.org/?addr=YOUR_WALLET_ADDRESS)

---

## Connecting Your Wallet

1. Click **Connect Wallet** in the top navigation bar
2. Freighter will prompt you to approve the connection — click **Approve**
3. Your wallet address will appear in the nav bar (e.g. `GABC…WXYZ`)
4. You are now connected and can browse investments

> **Note:** InvestX never stores or has access to your private key. All transactions are signed locally by Freighter.

---

## Investor Guide

### Step 1: Register / Sign In
1. Go to **Sign Up** and enter your name, email, and password
2. Connect your Freighter wallet
3. Your account is linked to your wallet address automatically

### Step 2: Complete KYC
KYC (Know Your Customer) is required before investing.

1. Navigate to **Account → Complete KYC**
2. Upload:
   - A clear selfie
   - Aadhaar card (front & back) or equivalent government ID
   - PAN card
3. Submit — verification typically takes 24–48 hours
4. You will receive a notification when KYC is approved ✅

### Step 3: Browse Businesses
1. Click **Explore** in the navigation
2. Filter by category (Food, Technology, Retail, etc.)
3. Click any business card to view:
   - Business description and financials
   - AI-generated risk score
   - Funding progress
   - Community vote history

### Step 4: Invest
1. On the business detail page, click **Invest Now**
2. Enter the amount in INR — equivalent XLM is shown automatically
3. Click **Confirm** — Freighter will open and show the transaction
4. Review the XDR transaction and click **Approve**
5. Your investment is locked in the Escrow Contract on Stellar ✅
6. Once the business reaches its funding goal, you receive fractional **Business Tokens** directly to your wallet

### Step 5: Track Your Portfolio
1. Go to **Dashboard → My Portfolio**
2. View all active investments, token balances, and estimated dividends
3. Live on-chain balances are fetched directly from Stellar

---

## Claiming Dividends

Dividends are paid monthly when a business submits verified revenue to the Dividend Contract.

1. A **RevenueVerification** governance proposal is created automatically
2. The community votes to verify the revenue claim
3. Upon proposal passing, XLM is distributed proportionally to all token holders
4. Dividends appear automatically in your Freighter wallet — no manual claim needed
5. View your payout history at **Dashboard → Dividend History**

---

## Business Owner Guide

### Step 1: Register as a Business Owner
1. Sign up and select **Business Owner** as your role

### Step 2: Apply for Funding
1. Navigate to **Raise Funds**
2. Fill in:
   - Business name, category, and description
   - Target funding amount (INR)
   - Revenue share percentage offered to investors
   - Monthly revenue and profit figures
3. Upload supporting documents (financial statements, business registration)
4. Submit the application

### Step 3: AI Screening
- Google Gemini AI analyzes your financial documents automatically
- A risk score (0–100) is generated and attached to your proposal
- You will see the score in your business dashboard

### Step 4: Governance Proposal
- A **BusinessApproval** proposal is created on the DAO Governance Contract
- Community members review your AI score and documents and vote
- Voting period: **7 days**
- If the proposal passes (supermajority), your business is approved ✅

### Step 5: Token Launch & Fundraising
- A unique Business Token (SEP-41) is minted for your business
- Investors can purchase fractional tokens during the fundraising window
- Track funding progress in your **Business Dashboard**

### Step 6: Submit Monthly Revenue
1. Go to **My Businesses → Submit Revenue**
2. Enter monthly revenue and deposit the revenue share in XLM
3. A RevenueVerification governance proposal is created automatically
4. Upon community approval, dividends are auto-distributed to token holders

---

## Governance & Voting

Every user with a connected Stellar wallet can vote on governance proposals.

### How to Vote
1. Click **Governance** in the navigation
2. Browse active proposals (BusinessApprovals, RevenueVerifications)
3. Open a proposal to read the full details and AI risk report
4. Click **Upvote** or **Downvote**
5. Freighter will prompt you to sign the vote transaction

### Voting Rules
- **1 wallet = 1 vote** — token-independent to prevent plutocracy
- Voting period: 7 days per proposal
- Supermajority (>60% approval) required for BusinessApprovals
- Simple majority required for RevenueVerifications

---

## Notifications
- Bell icon in the navbar shows unread notifications
- You receive alerts for: KYC status updates, investment confirmations, dividend payouts, and governance results

---

## FAQ

**Q: Is my money safe?**  
A: Investor funds are locked in a Soroban Escrow Contract — not held by any company or admin wallet. If a business fails to reach its funding goal, refunds are mathematically guaranteed by the smart contract.

**Q: What network should I use?**  
A: The platform currently runs on the **Stellar Testnet**. No real money is used. Switch Freighter to Testnet in Settings.

**Q: What is a Business Token?**  
A: A fractional ownership token (SEP-41) representing your share in a specific business. Token holders receive automated dividend payments.

**Q: Can I sell my tokens?**  
A: Secondary market trading is on the roadmap. Currently tokens represent long-term fractional ownership with dividend rights.

**Q: What is the minimum investment?**  
A: There is no minimum enforced by the platform. Stellar transaction fees are less than $0.00001.
