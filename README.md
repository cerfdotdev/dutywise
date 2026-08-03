# DutyWise

**AI-native customs brokerage as a service.** Mid-market importers buy the outcome — *imports clear, duties right, docs filed, refunds claimed* — not software they operate.

- Published per-entry pricing: **$99 ocean / $89 air / $69 truck**, $0 handling
- **Licensed broker sign-off on 100% of filings** (hard gate, sandbox demo)
- AI straight-through processing: document extraction, HTS classification, pre-audit
- Free **CAPE/IEEPA refund-eligibility audit** — estimates only, "we file, CBP pays"
- Monitoring subscriptions, transparent billing, forensic-ready audit posture

> ⚠️ **Sandbox notice:** this deployment runs in `SANDBOX_MODE`. Refund figures are estimates, not claims; no filings are transmitted to CBP; the "broker" is a demo role. Production would require licensing, E&O, and CBP ABI integration per the architecture docs.

## Repository layout

```
apps/web        Next.js 16 marketing site + customer portal (port 3000)
apps/api        Fastify 5 + Drizzle + Postgres 17 API (port 8000)
contracts/      OpenAPI contract (single source of truth for the API surface)
docker-compose.yml  Full stack (postgres + api + web) — Dokploy compose service
.github/        CI/CD (lint, typecheck, tests, builds, trivy + SBOM, Dokploy deploy)
```

## Architecture

| Concern | Decision |
|---|---|
| Framework (API) | Fastify 5, TypeScript strict, ESM |
| ORM / migrations | Drizzle ORM + drizzle-kit (advisory-locked one-shot migrations) |
| Auth | Argon2id + jose JWT; httpOnly `__Host-` cookies; 15-min access + rotating refresh with reuse detection (OWASP) |
| DB | Postgres 17 (postgres.js driver, `prepare:false`) |
| Frontend | Next.js 16 standalone, React 19, Tailwind v4, GSAP 3.15 + Lenis (a11y-first) |
| Proxy | Next route handler forwards `/api/*` to `API_INTERNAL_URL` at **runtime** (no CORS surface) |
| Security | Helmet, rate limits, origin checks, CSP/HSTS headers, non-root containers, trivy-scanned images, dependabot |
| CI/CD | GitHub Actions → tests/builds → image scans (trivy CRITICAL/HIGH) + SBOM (syft) → Dokploy `compose.deploy` via API |

## Local development

```bash
cp .env.example .env        # fill values
docker compose up -d        # postgres + api + web (web on http://localhost:3100 via override)
# or run apps separately:
npm --prefix apps/api run dev        # API on :8000 (needs DATABASE_URL, JWT_SECRET)
npm --prefix apps/web run dev        # web on :3000
```

**Demo tenant:** `demo@dutywise.app` / `demo-pass-1234` (seeded when `SEED_DEMO=true`).

## Tests

```bash
npm --prefix apps/api test   # vitest + real Postgres (TEST_DATABASE_URL, see CI service)
npm --prefix apps/web test
```

## Deployment (Dokploy)

1. GitHub Actions deploys automatically on `main` (secrets: `DOKPLOY_URL`, `DOKPLOYKEY`, `DOKPLOY_COMPOSE_ID`).
2. Dokploy builds both images from the repo (Dockerfiles), runs `docker-compose.yml`, provisions LetsEncrypt for `dutywise.dok.cerf.codes` + `api.dutywise.dok.cerf.codes`.
3. Migrations run inside the API container under a Postgres advisory lock (safe for rolling restarts).

## Legal/trust posture

- Refund audits produce **estimates only** — never claims, never guarantees. "We file, CBP pays."
- No secrets in the repo; env via `.env`/Dokploy; audit data retained 30 days for public audits (see `/legal/privacy`).
