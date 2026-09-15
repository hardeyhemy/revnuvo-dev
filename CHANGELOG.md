# Changelog

All notable changes to the Revnuvo developer distribution surfaces
(API, MCP, SDKs, examples). Package-specific releases are tagged on npm/PyPI.

## [1.0.0] — 2026-09-15 — Distribution Engine GA

### Added
- Canonical REST Intelligence API v1 at `https://intel.revnuvo.site/v1`:
  `search_company`, `get_company`, `get_company_state`, `get_company_timeline`,
  `get_company_technologies`, `get_company_changes`, `search_signals`,
  `monitor_company`, `verify_company`, `whoami`.
- Production remote MCP server at `https://mcp.revnuvo.site/mcp`
  (Streamable HTTP, JSON-RPC 2.0, protocol 2025-06-18, stateless)
  with 9 `revnuvo_*` tools.
- FREE DEVELOPER tier: 100 intelligence calls/month (REST + MCP shared quota),
  10 calls/min, 3 monitored domains. Server-enforced, metered.
- x402 per-call machine payments: `POST /v1/x402/company-state`, $0.01 USDC on Base.
- npm SDK `revnuvo` 0.1.0 (client + `revnuvo` CLI) and PyPI SDK `revnuvo-intel` 0.1.0.
- 7 runnable examples, QUICKSTART, developer docs at intel.revnuvo.site.
- Partner/referral attribution (`?ref=`) and funnel analytics.
- OpenAI submission pack + NVIDIA ecosystem readiness pack (status: prepared).

### Honesty notes
- Checkout not yet live (billing provider decision pending); upgrade endpoint
  returns 501 with manual-activation + x402 alternatives. No fake payments.
- `verify_company` reports observation evidence; trust score included only when
  the Trust service is reachable.

## [0.1.0] — 2026-08 — Trust MCP initial release
- revnuvo-trust-mcp (npm), revnuvo-trust (PyPI), official MCP Registry listing
  (io.github.hardeyhemy/revnuvo-trust-mcp), x402 Trust API.
