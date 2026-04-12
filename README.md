# InvestX - Fully Decentralized Investment Platform
<img width="2860" height="1563" alt="Screenshot from 2026-04-12 23-13-37" src="https://github.com/user-attachments/assets/f299c8b8-522d-4b7b-a61d-1c126d4a161d" />

**A decentralized, community-governed platform on Stellar + Soroban that enables fractional investment in local businesses with AI-driven scoring and no central authority.**

![Track](https://img.shields.io/badge/Track-Web3%20Credit-blue) ![Status](https://img.shields.io/badge/Status-Live%20MVP-brightgreen) ![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-green) ![CI/CD](https://img.shields.io/badge/CI%2FCD-passing-brightgreen)

## Quick Links

| Resource | Link | 
|----|-----|
| **Live Demo** | [Live Link](https://investx-iota.vercel.app/) | 
| **Smart Contract** | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CCIMHOZAMXQXJRJJXAMBX2GXSGP6BCU7YRLYTJ5IJ446XEJYEW56UBAH) |
| **Users Data & Review** | [Users Excel Sheet](https://docs.google.com/spreadsheets/d/1MG5PhFI698WouwF6j5sU0aNFcvU6wT-Cdxr_Fecw1GE/edit?gid=47422734#gid=47422734) |

**Level 5 Building Submission Checklist**
| Requirement | Status | Proof |
|------|------|------|
| **Live Demo Deployed** | ✅Done |  [Live Link](https://investx-iota.vercel.app/) | 
| **CI/CD Pipeline** | ✅Done | [Check in GitHub](https://github.com/anindhabiswas25/InvestX/actions/workflows/ci.yml) |
| **Smart Contract Deployed** | ✅Done | CCIMHOZAMXQXJRJJXAMBX2GXSGP6BCU7YRLYTJ5IJ446XEJYEW56UBAH |
| **Mobile Responsive** | ✅Done | See screenchot view below |
| **Registered Users** | ✅Done | [35+ verified users Excel Sheet Data](https://docs.google.com/spreadsheets/d/1MG5PhFI698WouwF6j5sU0aNFcvU6wT-Cdxr_Fecw1GE/edit?gid=47422734#gid=47422734) |

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
## Mobile Responsive View
<p align="center">
  <img src="https://github.com/user-attachments/assets/374cb3fe-e88c-49b8-b2a8-9ca7e1e7d674" width="250"/>
</p>


## CI/CD Pipeline
<img width="2880" height="1800" alt="Screenshot from 2026-04-11 00-32-39" src="https://github.com/user-attachments/assets/7fea726b-a9e8-449d-b2dd-0a3f972a489a" />

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
| **Sample Transaction Hash** | [View on stellar Expert](https://stellar.expert/explorer/testnet/contract/CAZZHGGQCK4XYSWQOY7NPSU247XMWA4PNJWUA6NU47TPQFK4E6EGVYZZ) |

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

## CI/CD

- CI: GitHub Actions workflows under `.github/workflows/`
- Frontend CD: Vercel (`frontend/` root)
- Backend CD: Render (`render.yaml`)
- Full setup guide: `docs/CI-CD-PIPELINE.md`

## License
MIT
