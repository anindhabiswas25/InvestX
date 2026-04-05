# InvestX - Fully Decentralized Investment Platform

Community-powered fractional investment platform for local businesses, built on Stellar + Soroban with AI-assisted business scoring and **fully decentralized on-chain governance**. No centralized admin approvals—the community decides everything!

## Table of Contents
- [Problem Statement](#problem-statement)
- [Our Solution](#our-solution)
- [Project Structure](#project-structure)
- [System Architecture](#system-architecture)
- [Technical Stack](#technical-stack)
- [Advanced Features](#advanced-features)
- [Deployed Contracts](#deployed-contracts)
- [User & Business Flows](#complete-user-flows)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [License](#license)

## Problem Statement

India has over 15 million small businesses that struggle to access traditional bank financing. Banks typically reject 70%+ of small business loan applications due to strict collateral requirements and lack of formal credit history. Simultaneously, everyday citizens and local patrons have no secure, accessible, and transparent way to invest in the local businesses they already trust, leaving a massive financing and wealth-generation gap.

## Our Solution

InvestX bridges this gap by enabling **fractional investment** in vetted local businesses through blockchain-powered tokenization and decentralized decision-making:
- **Micro-Investments:** Investors can buy fractional shares in businesses starting at tiny amounts using Stellar-based tokenization.
- **AI-Powered Fairness:** We use Google Gemini AI to analyze raw business financials and generate unbiased risk assessments.
- **Fully Decentralized:** No central admin holds power. All business approvals and monthly dividend payouts are verified and executed by the community through a DAO Governance Smart Contract.
- **Trustless Escrow:** Investor funds are locked on-chain. If funding fails, funds are mathematically guaranteed to be refunded via Soroban contracts.

## Project Structure
```text
InvestX/
├── backend/                # Node.js/Express API, AI coordination
├── frontend/               # React web application with Freighter wallet
├── smart-contracts/        # Rust (Soroban) contracts & Hardhat scripts
│   ├── business-token/     # SEP-41 token factory
│   ├── escrow-contract/    # Trustless fundraising escrow
│   ├── dividend-contract/  # Automated revenue payouts
│   ├── document-registry/  # Cryptographic hash anchoring for KYC
│   └── governance-contract/# DAO voting logic
├── docs/                   # Supplemental documentation
└── start-local.ps1         # Convenience script for local startup
```

## System Architecture

InvestX uses a hybrid Web2/Web3 architecture. Heavy documents, KYC, and AI scoring run off-chain, while all financial logic, voting, and token ownership is strictly on-chain via Soroban.

```mermaid
graph TD
    Client[React Frontend] -->|Freighter Wallet| Network[Stellar Testnet]
    Client -->|REST API| API[Node.js Backend]
    API -->|AI Prompting| AI[Gemini AI]
    API -->|Data Storage| DB[(MongoDB)]
    API -->|Stellar SDK| Network
    
    subgraph Soroban Smart Contracts
        Network --> Gov(Governance Contract)
        Network --> Escrow(Escrow Contract)
        Network --> Div(Dividend Contract)
        Network --> Reg(Document Registry)
        Network --> Tok(Business Token)
    end
```

## Technical Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React, TailwindCSS, Axios | UI and client-side application |
| **Backend** | Node.js, Express 5 | REST API, AI coordination, tx simulation |
| **Database** | MongoDB Atlas | Off-chain profiles, metadata, caching |
| **Blockchain** | Stellar (Testnet) | Settlement layer |
| **Smart Contracts**| Rust (Soroban) | Decentralized logic and tokenization |
| **Wallets** | Freighter API (v6+) | Transaction signing |
| **AI Engine** | Google Gemini | Automated risk assessment & credit scoring |

## Advanced Features

- **Fully Decentralized Governance (DAO):** Zero admin intervention. All business approvals and revenue verification actions are executed via community voting on the Governance Smart Contract.
- **Fractional Tokenization:** Businesses are minted as SEP-41 compliant tokens. Investors can make micro-investments tracking fractional ownership.
- **On-Chain Escrow:** Investor funds are locked in a trustless Soroban escrow. If a business fails its funding goal, funds are mathematically guaranteed to be refunded.
- **Automated Dividend Routing:** Businesses submit XLM profits to the Dividend contract, which auto-routes payouts directly to token holders proportional to their shares based on real-time on-chain balances.

## Deployed Contracts

*All contracts deployed on the Stellar Testnet.*

| Contract Function | Testnet Contract ID |
|-------------------|----------------------|
| **Business Token (Factory)** | CCGD5P3SCFVBQHQJFG5YEHSDTGZQ27UFUTRGMM5FWT3FFMQ37QA2WIWM |
| **Escrow Manager** | CDQJFA7FWAFENCOBGYI5YTEIIIV2JWYWGPKMFTSKZCS3GVSVPSVDULXU |
| **Dividend Distributor** | CDH35PFTCU2WXPQ3LW4NFDJADNCEKK7RNH2UUNH5JRKFZ7O7U3UCFY6C |
| **Document Registry** | CAZZHGGQCK4XYSWQOY7NPSU247XMWA4PNJWUA6NU47TPQFK4E6EGVYZZ |
| **DAO Governance** | CCIMHOZAMXQXJRJJXAMBX2GXSGP6BCU7YRLYTJ5IJ446XEJYEW56UBAH |

## Complete User Flows

### 1. Business Owner Flow
1. **Onboarding:** Owner registers, provides details, and uploads financial documents via Pinata IPFS.
2. **AI Screening:** Backend parses the financials via Gemini AI, generating a risk score and report.
3. **Governance Proposal:** A BusinessApproval proposal is automatically created on-chain.
4. **DAO Vote:** The community reviews the AI score and votes. If passed, the business is approved.
5. **Token Minting & Funding:** A customized business token is launched. Investors fund via the Escrow contract.
6. **Dividend Distribution:** Owner reports monthly revenue, deposits XLM to the Dividend Contract, which triggers a RevenueVerification DAO vote. Upon passing, dividends auto-disburse to token holders.

### 2. Investor Flow
1. **Registration:** Sign up natively and connect the Freighter Wallet.
2. **Browse:** Discover DAO-approved local businesses actively fundraising.
3. **Invest:** Fund businesses directly via Freighter. XLM is secured in the Soroban Escrow contract.
4. **Earn:** Receive fractional tokens if the campaign succeeds. Receive automated XLM dividend payments directly to the wallet based on live on-chain token balance.

### 3. DAO Voter Flow
1. **Review Proposals:** View active business applications and revenue verifications.
2. **Analyze Data:** Read AI-generated risk reports and cryptographically verified document hashes.
3. **Vote On-Chain:** Sign transactions via Freighter to cast Upvote / Downvote on Soroban.

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas or local MongoDB instance
- Freighter wallet funded on Stellar testnet

### 1) Clone
``bash
git clone https://github.com/anindhabiswas25/InvestX.git
cd InvestX
```

### 2) Backend
``bash
cd backend
npm install
npm run dev
```

### 3) Frontend
``bash
cd frontend
npm install
npm start
```

## License
MIT
