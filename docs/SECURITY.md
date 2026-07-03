# Security model

## Credentials

- AES-256-GCM envelope format with per-record additional authenticated data.
- GitHub installation tokens are short-lived and requested only for repository operations.
- OAuth/provider tokens remain server-side and are never added to prompts or logs.
- Webhook signatures are verified before parsing and delivery IDs are idempotent.

## Repository and web isolation

- Repository URLs are restricted to HTTPS GitHub repositories.
- Patch paths cannot be absolute, escape the repository, or modify `.git`.
- Commands use argument arrays with `shell:false`.
- Customer build commands execute in a separate HMAC-authenticated runner service that has no control-plane or provider credentials.
- Git authentication uses an ephemeral HTTP header; installation tokens are not placed in process arguments or repository remotes.
- Repositories without a reliable build adapter are analysis-only.
- Site fetching rejects private, loopback, link-local, credential-bearing, and non-HTTP URLs.
- Website and repository text are explicitly labeled untrusted against prompt injection.

## Production changes

The application requires all of:

1. Proposal state `ready`.
2. Explicit authenticated checkbox-and-click confirmation.
3. Passing commit status and a mergeable pull request.
4. Detected branch protection.
5. A GitHub review and merge using the approving user's OAuth token.

Voice, background agents, webhooks, workers, and GitHub App installation tokens cannot satisfy the human approval requirement.

## Recommended deployment hardening

- Put the worker/runner behind private ingress and restrict egress.
- Use a managed KMS to wrap `CREDENTIAL_ENCRYPTION_KEY`.
- Enable Supabase PITR and audit export.
- Require signed commits, CODEOWNERS, two-person approval for critical-risk proposals, and secret scanning.
- Add WAF/rate limits to OAuth, media, crawling, and webhook endpoints.
