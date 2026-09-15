# API Reference (summary)

Full interactive docs: https://intel.revnuvo.site/docs/api

Base: `https://intel.revnuvo.site/v1` · Auth: `Authorization: Bearer rvk_...`

| Endpoint | Purpose |
|---|---|
| `GET /v1/whoami` | key identity, plan, quota |
| `GET /v1/companies?query=` | search observed companies |
| `GET /v1/companies/{domain}` | company overview |
| `GET /v1/companies/{domain}/state` | latest full observed state |
| `GET /v1/companies/{domain}/timeline` | observations + events |
| `GET /v1/companies/{domain}/technologies` | tech stack w/ evidence |
| `GET /v1/companies/{domain}/changes` | change events w/ before/after |
| `GET /v1/signals` | cross-company signal search |
| `POST /v1/monitor` | monitor a domain |
| `POST /v1/verify` | evidence-backed verification |
| `POST /v1/x402/company-state` | x402 paid access (no account) |

Error codes: `invalid_api_key_format` · `unknown_or_revoked_api_key` ·
`rate_limit_exceeded` · `monthly_quota_exhausted` · `plan_limit` ·
`not_observed` · `invalid_domain`. Quota headers on every response:
`x-revnuvo-quota-limit`, `x-revnuvo-quota-used`.
