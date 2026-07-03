# SEOForge

SEOForge is a public, multi-tenant SEO/GEO operations platform. Each customer connects a verified website, an explicitly selected GitHub repository, deployment checks, analytics providers, and customer-owned DataForSEO credentials. A structured Gemini agent team investigates continuously and prepares protected pull requests. Production changes always require an authenticated human click and passing GitHub branch protection.

## What is implemented

- GitHub OAuth identity and least-privilege GitHub App onboarding
- Supabase Postgres schema with RLS tenant isolation
- DataForSEO keyword, autocomplete, related-keyword, SERP, backlink, domain, and competitor-gap adapters
- Corrected SEO/GEO knowledge derived from `seo-geo-1.0.0`
- Gemini Interactions specialists with strict JSON outputs and minimal retention
- Gemini Live ephemeral-token voice review; voice cannot approve or mutate production
- Gemini image, narration, video generation, per-site brand profiling, and S3 artifact manifests
- BullMQ worker with post-deploy, daily, weekly, and monthly workflows
- Isolated repository runner with framework detection, validation, protected branch creation, and PR opening
- Explicit in-app approval plus GitHub check/branch-protection enforcement
- Stripe Checkout subscriptions, Customer Portal, entitlements, reservation-first usage, and idempotent webhooks
- Dashboard, REST API, SSE activity stream, and CLI
- Per-site search cockpit, rank portfolio, structured live agent telemetry, findings workflow, experiments, content calendar, proposal file review, and developer portal
- OAuth 2.1 PKCE with 15-minute access tokens, rotating refresh tokens, keyed-hash `sf_test_...` / `sf_live_...` service credentials, TypeScript/Python SDKs, and a Streamable HTTP MCP gateway
- Search Console, DataForSEO, backlink and PageSpeed ingestion into normalized observations

## Local setup

Requirements: Node.js 20+, Supabase, Redis, a Gemini API key, a GitHub OAuth App and GitHub App, and optional external provider credentials.

```bash
cp .env.example .env.local
npm install
npm run build
docker compose up redis -d
npm run dev:web
npm run dev:runner
npm run dev:worker
```

Apply both migrations in order to a new Supabase project:

```bash
supabase db push
```

- `supabase/migrations/202607030001_initial_platform.sql`
- `supabase/migrations/202607030002_search_intelligence.sql`

Configure GitHub as a Supabase Auth provider and use `/auth/callback` as the application callback.

### GitHub App

Create the App from [`docs/github-app-manifest.json`](docs/github-app-manifest.json), replace the example URLs, and configure:

- Setup URL: `<APP_URL>/api/github/setup`
- Webhook URL: `<APP_URL>/api/webhooks/github`
- Repository selection: user-selected repositories only
- Main branches: require pull requests and status checks

### Stripe

Create recurring Prices for Starter, Pro, and Agency. Put quota dimensions in Price metadata (`sites`, `trackedQueries`, `crawlPages`, `agentRuns`, `images`, `audioSeconds`, `videoSeconds`, `storageBytes`, and `concurrency`) and `planKey` in each Price. Set the IDs in the environment. The app uses Stripe Billing, Checkout Sessions, and Customer Portal—not manual PaymentIntent renewals.

### Vercel

Deploy the web app with the repository root as project root. The worker and isolated runner must run as separate persistent containers on private networking. The runner receives only a signed job and short-lived installation token; it must not receive Supabase, Stripe, Gemini, or provider credentials. Customer websites can connect through Vercel OAuth or a protected GitHub Actions workflow.

## Commands

```bash
npm run dev:web
npm run dev:runner
npm run dev:worker
npm run build
npm run typecheck
npm test
npm run check
```

CLI development:

```bash
npm run build -w @seoforge/cli
node apps/cli/dist/index.js login --api-url http://localhost:3000 --environment live --token sf_live_...
node apps/cli/dist/index.js site:add --name Docs --url https://example.com --repo owner/repo --installation 123
node apps/cli/dist/index.js audit --site <uuid>
node apps/cli/dist/index.js runs watch
node apps/cli/dist/index.js mcp install --client codex
```

API contract: [`docs/openapi.yaml`](docs/openapi.yaml). TypeScript SDK: `@seoforge/sdk`. The dependency-free Python client is in [`sdk/python/seoforge.py`](sdk/python/seoforge.py).

### Remote MCP

The Cloudflare Worker in `apps/mcp` serves Streamable HTTP with OAuth protected-resource discovery. Deploy test and live separately:

```bash
npm run deploy:test -w @seoforge/mcp
npm run deploy:production -w @seoforge/mcp
```

The tool allowlist has no approval, merge, deploy, credential retrieval, or branch-protection bypass capability.

## Production boundaries

- Models receive redacted repository excerpts and evidence, never credentials.
- Unknown repositories remain analysis-only until validation is detectable.
- Generated claims require evidence. Ratings, testimonials, statistics, dates, and credentials may not be invented.
- INP is used instead of FID. HowTo rich results are never recommended. FAQ rich-result advice is restricted.
- Rank #1 is an objective, never a guarantee.
- Audio/video assets live in object storage; repository changes reference their immutable manifest.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/SECURITY.md`](docs/SECURITY.md), and [`docs/SOURCE_SKILL_PARITY.md`](docs/SOURCE_SKILL_PARITY.md).
Public launch status and required external proofs are tracked in [`docs/PRODUCTION_LAUNCH_GATES.md`](docs/PRODUCTION_LAUNCH_GATES.md).
