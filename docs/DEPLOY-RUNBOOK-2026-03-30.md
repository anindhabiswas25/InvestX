# InvestX Deployment Runbook (2026-03-30)

## 1) Stellar Testnet Contracts Deployed

Admin address used:
- GBFONIF2XYE7HCJ5RUSRQRZCCCYGMPKM3XDMUKIQJJPZOAHUGJNDOZDG

Contract IDs:
- INVX_TOKEN_CONTRACT_ID=CDX236JMI3EL77ZHZFYF5VS3JK7SPXJ2JX6NXIFKUOSXBJJU4TMZ3KXJ
- BUSINESS_TOKEN_CONTRACT_ID=CAVH3JASVQT5YZY2NRCYXIIJ6IJYSKCHWMAN5E3CKCBBNKDTTRHM75UW
- ESCROW_CONTRACT_ID=CDQJFA7FWAFENCOBGYI5YTEIIIV2JWYWGPKMFTSKZCS3GVSVPSVDULXU
- ESCROW_CONTRACT_ADDRESS=CDQJFA7FWAFENCOBGYI5YTEIIIV2JWYWGPKMFTSKZCS3GVSVPSVDULXU
- DIVIDEND_CONTRACT_ID=CDH35PFTCU2WXPQ3LW4NFDJADNCEKK7RNH2UUNH5JRKFZ7O7U3UCFY6C
- DOCUMENT_REGISTRY_ID=CAIE2RAQSPRSEAE6T2QAFLLCVKHBGGNLNWT2W3VWAEFCRM6ZLN4NCULJ
- GOVERNANCE_CONTRACT_ID=CBFAUXFHEYMYII7DMDU2D755GFAXOZI7PKVOC6IFHJSXVX3KCV7GVWVT
- REWARD_DISTRIBUTOR_ID=CCBG7UWMGPPZLG7FSE2JOLVBJD2A274ZWMHVAF5ATU2DJSRKIC2NKZ3Z

These IDs were also written into backend/.env by the deployment script.

## 2) Backend Hosting (Render)

File added:
- render.yaml

Steps:
1. Push repository to GitHub.
2. In Render, create Blueprint from this repo.
3. Fill required secret env vars in Render:
   - MONGODB_URI
   - JWT_SECRET
   - FRONTEND_URL
   - STELLAR_ADMIN_SECRET
   - ADMIN_WALLET_PRIVATE_KEY (same value as STELLAR_ADMIN_SECRET)
   - Any optional API keys (Cloudinary, Resend, Gemini, Pinata)
4. Deploy service `investx-backend`.
5. Confirm health endpoint:
   - https://your-backend-url/api/health

## 3) Frontend Hosting (Vercel)

Files added:
- frontend/vercel.json
- frontend/.env.example

Required Vercel env vars:
- REACT_APP_API_URL=https://your-backend-url.onrender.com
- REACT_APP_STELLAR_EXPLORER_URL=https://stellar.expert/explorer/testnet
- REACT_APP_GOVERNANCE_ADDRESS=CBFAUXFHEYMYII7DMDU2D755GFAXOZI7PKVOC6IFHJSXVX3KCV7GVWVT

Steps:
1. Import repository in Vercel.
2. Set project root to `frontend`.
3. Add env vars above.
4. Deploy and open the site.

## 4) Integration Checklist

- Backend CORS `FRONTEND_URL` matches Vercel URL exactly.
- Frontend `REACT_APP_API_URL` points to Render backend URL.
- Backend has all deployed contract IDs configured.
- Wallet is Freighter on Stellar Testnet.

## 5) Current Known Blocker

Local backend startup currently reports MongoDB connection resolution errors (`ECONNREFUSED` on SRV host). Fix by using a reachable MongoDB Atlas connection string and allowing IP/network access.
