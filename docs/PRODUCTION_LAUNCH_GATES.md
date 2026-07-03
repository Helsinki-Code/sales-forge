# SEOForge production launch gates

SEOForge stays internally gated until every item below is evidenced in both isolated test and live infrastructure. A successful local build is necessary, not sufficient, for public launch.

## Automated code gates

- [x] TypeScript typecheck across web, worker, runner, CLI, MCP and SDK.
- [x] Unit tests for scoring, token hashing, production-mutation policy, prompt policy, webhooks, repository validation and SEO knowledge.
- [x] Production Next.js and service builds.
- [x] API/CLI/MCP contain no merge or deploy tool; the merge endpoint rejects service/OAuth tokens.
- [x] Every changed proposal file must be approved before the UI merge handler proceeds.
- [x] Test/live token prefixes and workspace environments are enforced.

## External infrastructure gates

- [ ] Apply and verify both migrations independently in test and live Supabase projects.
- [ ] Run cross-tenant RLS attack tests with at least two workspaces and revoked credentials.
- [ ] Provision separate live/test Redis, queues, object storage, encryption keys and Cloudflare Worker environments.
- [ ] Deploy `mcp.test.seoforge.ai` and `mcp.seoforge.ai`; verify OAuth discovery, PKCE, refresh rotation and consent in Codex, Claude and Cursor.
- [ ] Publish provenance-signed pinned CLI and TypeScript SDK packages; generate and publish the Python SDK artifact.
- [ ] Verify GitHub App install/revoke, protected branches and required checks on representative Next.js, static, non-JS and unsupported repositories.
- [ ] Verify Vercel preview/production and protected Actions fallback without bypass capability.
- [ ] Verify GSC, GA4, DataForSEO, PageSpeed/CrUX, Bing/IndexNow, backlink and approved AI-citation provider contracts with production credentials.
- [ ] Verify Stripe entitlement metadata, webhook replay/idempotency, hard quota stops and workspace spend limits.
- [ ] Verify Resend, Slack OAuth and signed webhook retries/dead-letter behavior.
- [ ] Complete mobile, dark-mode, keyboard, reduced-motion and WCAG 2.2 AA audit.
- [ ] Run worker-crash, Redis outage, provider circuit-breaker, runner autoscaling, queue-lag and dead-letter recovery exercises.
- [ ] Load-test API/MCP concurrency and scheduled 24/7 operation to the target envelope.
- [ ] Complete security review for SSRF, prompt injection, credential redaction, OAuth, webhook signatures and artifact access.
- [ ] Observe availability, provider freshness, spend, error rate and deployment health against a 99.9% SLO during a pre-launch soak.

Rank #1 is always an optimization objective, never a product guarantee. Dashboards label provider measurements, forecasts and agent hypotheses separately.
