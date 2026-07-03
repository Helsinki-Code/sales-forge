# `seo-geo-1.0.0` parity

| Source capability | Application equivalent | Status |
|---|---|---|
| Website audit | SSRF-safe page snapshot, discovery-file inspection, deterministic findings | Implemented |
| Meta/H1/image/schema extraction | Typed page snapshot and evidence records | Implemented |
| Robots and sitemap checks | Post-deploy and full-audit discovery inspection | Implemented |
| Keyword research | `DataForSeoClient.keywordIdeas` | Implemented |
| Autocomplete ideas | `DataForSeoClient.autocomplete` | Implemented |
| Related keywords | `DataForSeoClient.relatedKeywords` | Implemented |
| SERP analysis | Daily tracked-query snapshots | Implemented |
| Backlinks | `DataForSeoClient.backlinks` | Implemented |
| Domain overview | `DataForSeoClient.domainOverview` | Implemented |
| Competitor gap | `DataForSeoClient.competitorGap` | Implemented |
| P0/P1/P2 prioritization | Critical/high/medium/low/info findings | Implemented |
| Princeton GEO methods | Evidence-safe GEO method registry and Content/GEO agent | Implemented with factuality corrections |
| Schema templates | Current schema policy and QA constraints | Implemented; deprecated/restricted types corrected |
| Monitoring ideas | Post-deploy, daily, weekly, monthly durable schedules | Implemented |
| Reports | Dashboard findings, proposals, audit log, REST/CLI JSON | Implemented |

## Intentional corrections

- INP replaces FID.
- HowTo rich-result recommendations are prohibited.
- FAQ rich results are not promised for commercial sites.
- Meta keywords are not generated.
- Structured data is not described as a direct ranking improvement.
- Indexing API is not applied outside eligible content types.
- Statistics and quotes require captured sources.
