# Revnuvo MCP

Endpoint: `https://mcp.revnuvo.site/mcp` · Streamable HTTP (JSON-RPC 2.0) ·
protocol `2025-06-18` · stateless (no session header) · auth: API key header
(or `?key=` fallback).

Tools: `revnuvo_search_company`, `revnuvo_get_company`, `revnuvo_get_company_state`,
`revnuvo_get_company_timeline`, `revnuvo_get_company_technologies`,
`revnuvo_get_company_changes`, `revnuvo_search_signals`, `revnuvo_monitor_company`,
`revnuvo_verify_company`.

- Same API keys and shared quota as REST (one metered identity).
- HTTP `401` = auth failure; `429` = quota/rate limit (upgrade URL in body).
- `-32601` unknown method · `-32602` unknown tool · `-32700` parse error.
- GET/DELETE on `/mcp` → `405` (no server-initiated SSE stream).

Full docs: https://intel.revnuvo.site/docs/mcp
