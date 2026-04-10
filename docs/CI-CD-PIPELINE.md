# InvestX CI/CD Pipeline

This project uses:
- **GitHub Actions** for CI checks
- **Vercel** for frontend deployment (`frontend/`)
- **Render** for backend deployment (`backend/` via `render.yaml`)

## 1) Branching and protection

- Production branch: `main`
- Require pull requests for changes to `main`
- Require these status checks before merge:
  - `Detect changed areas`
  - `Frontend CI` (when frontend paths change)
  - `Backend CI` (when backend paths change)
  - `Smart Contracts CI` (when contract paths change)
- Disable direct pushes to `main`

## 2) GitHub Actions workflows

### `CI` (`.github/workflows/ci.yml`)

Runs on:
- Pull requests to `main`
- Pushes to `main`

Jobs:
- **Frontend CI**
  - `npm install --no-audit --no-fund`
  - `npm run test:ci`
  - `npm run build`
- **Backend CI**
  - `npm install --no-audit --no-fund`
  - `npm run test:ci` (health smoke test)
- **Smart Contracts CI**
  - `npm install --no-audit --no-fund`
  - `npm run test:ci` (`hardhat compile`)

Path filtering skips unrelated jobs in pull requests.

### `Post Deploy Verify` (`.github/workflows/post-deploy-verify.yml`)

Runs after successful `CI` workflow on pushes to `main`.

Checks:
- `GET $RENDER_BACKEND_URL/api/health`
- `GET $VERCEL_FRONTEND_URL`

GitHub repository secrets used by this workflow:
- `RENDER_BACKEND_URL`
- `VERCEL_FRONTEND_URL`

If these are unset, verification is skipped.

## 3) Vercel setup (frontend CD)

Project settings:
- Root directory: `frontend`
- Production branch: `main`
- Preview deployments: enabled for pull requests

Environment variables:
- `REACT_APP_API_URL`
- `REACT_APP_STELLAR_EXPLORER_URL`
- `REACT_APP_GOVERNANCE_ADDRESS`

## 4) Render setup (backend CD)

Deploy from repository using `render.yaml`.

Required environment variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `STELLAR_ADMIN_SECRET`
- `ADMIN_WALLET_PRIVATE_KEY`
- `INVX_TOKEN_CONTRACT_ID`
- `BUSINESS_TOKEN_CONTRACT_ID`
- `ESCROW_CONTRACT_ID`
- `ESCROW_CONTRACT_ADDRESS`
- `DIVIDEND_CONTRACT_ID`
- `DOCUMENT_REGISTRY_ID`
- `GOVERNANCE_CONTRACT_ID`
- `REWARD_DISTRIBUTOR_ID`

Optional:
- `GEMINI_API_KEY`
- `PINATA_JWT`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## 5) Security notes

- Do not store real credentials in repository files.
- Use `.env.example` files for placeholders only.
- Rotate any keys that were previously committed.
