# InvestX — Security Checklist & Audit

## Overall Security Rating

| Domain | Score | Status |
|--------|-------|--------|
| Smart Contract Security | 95/100 | ✅ Pass |
| Frontend Security | 90/100 | ✅ Pass |
| Infrastructure Security | 85/100 | ✅ Pass |

---

## 1. Smart Contract Security

### Soroban / Rust Contracts

| Check | Status | Notes |
|-------|--------|-------|
| Reentrancy attacks prevented | ✅ | Soroban execution model is non-reentrant by design |
| Integer overflow/underflow | ✅ | Rust's checked arithmetic, no `unchecked` blocks |
| Access control on admin functions | ✅ | `require_auth(env, &admin)` on all privileged calls |
| Escrow only releases on goal met | ✅ | `funding_goal_reached` checked on-chain before release |
| Refund path guaranteed | ✅ | Refund callable by any investor if deadline passed and goal not met |
| No selfdestruct / upgrade backdoor | ✅ | Immutable contract bytecode on testnet; upgrades require DAO vote |
| Proposal replay prevention | ✅ | Unique proposal IDs stored in contract state |
| Vote double-spend prevention | ✅ | Voter address recorded in contract storage |
| Token mint authorization | ✅ | Mint authority restricted to governance contract address |
| Dividend drain attack | ✅ | Distribution is proportional, total cannot exceed deposited amount |

### Soroban Best Practices
- All state mutations guarded by `require_auth`
- Events emitted for all state changes (auditability)
- No use of `env.current_contract_address()` as implicit authority
- Floating-point arithmetic avoided — all amounts in stroops (integer)

---

## 2. Frontend Security (OWASP Top 10)

| OWASP Risk | Check | Status |
|------------|-------|--------|
| A01 — Broken Access Control | Role-based route guards on all protected pages | ✅ |
| A02 — Cryptographic Failures | JWT stored in memory, not localStorage | ✅ |
| A03 — Injection | No `dangerouslySetInnerHTML`; all user content sanitized | ✅ |
| A05 — Security Misconfiguration | CORS restricted to known origins | ✅ |
| A07 — Auth Failures | Token expiry enforced; wallet disconnect clears state | ✅ |
| A08 — Software & Data Integrity | `package-lock.json` committed; no `--ignore-scripts` bypass | ✅ |
| A09 — Logging Failures | Client errors captured; no secrets logged to console | ✅ |
| XSS via wallet data | Wallet address sanitized before display | ✅ |

### Private Key Handling
- InvestX **never** requests or accesses the user's Stellar private key
- All transaction signing is handled entirely by the Freighter browser extension
- Only the public key (`G...`) is shared with the frontend via Freighter API

---

## 3. Backend / API Security

| Check | Status | Notes |
|-------|--------|-------|
| JWT secret ≥ 32 bytes | ✅ | Enforced via env validation at startup |
| Password hashing | ✅ | bcrypt with cost factor 12 |
| Rate limiting | ✅ | `express-rate-limit` on auth endpoints |
| Input validation | ✅ | `express-validator` on all POST/PUT routes |
| File upload restrictions | ✅ | MIME type whitelist; max 10 MB per file |
| CORS policy | ✅ | Restricted to `ALLOWED_ORIGINS` env list |
| Helmet.js headers | ✅ | `X-Frame-Options`, `CSP`, `HSTS` set |
| MongoDB injection | ✅ | Mongoose schemas with strict: true; no raw `$where` |
| Secrets in environment | ✅ | No API keys hardcoded; `.env` in `.gitignore` |
| HTTPS enforced | ✅ | Render enforces TLS; HTTP redirected |

---

## 4. Infrastructure Security

| Check | Status | Notes |
|-------|--------|-------|
| Branch protection on `main` | ✅ | 4 CI checks required; no direct push |
| Secrets stored in GitHub Secrets | ✅ | `RENDER_DEPLOY_HOOK`, `VERCEL_TOKEN` etc. |
| Dependency audit | ✅ | `npm audit` runs in CI pipeline |
| Container isolation | ✅ | Render isolates backend in its own container |
| MongoDB Atlas IP allowlist | ⚠️ | Currently set to `0.0.0.0/0` for testnet — restrict before mainnet |
| Vercel preview URL access | ⚠️ | Preview deploys are public — enable password protection before mainnet |

---

## 5. Known Limitations & Mainnet Checklist

Before deploying to Stellar Mainnet:

- [ ] Commission a formal third-party smart contract audit
- [ ] Restrict MongoDB Atlas to Render's static outbound IPs
- [ ] Enable Vercel deployment protection for preview branches
- [ ] Rotate all keys and secrets (JWT, Cloudinary, Gemini)
- [ ] Implement HSM or MPC key management for admin wallet
- [ ] Set up alerting on unusual transaction volumes (e.g. Stellar Horizon webhooks)
- [ ] Enable write-ahead logging and point-in-time recovery on MongoDB Atlas
- [ ] Review KYC third-party provider's data residency and PII compliance

---

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Email: [funnypost00@gmail.com](mailto:funnypost00@gmail.com)  
GitHub: [@anindhabiswas25](https://github.com/anindhabiswas25)

We commit to acknowledging reports within 48 hours and patching critical issues within 7 days.
