# Revnuvo Developer

**Give AI agents live intelligence about companies.**

Revnuvo observes company websites, technologies, DNS and infrastructure over time, detects meaningful changes, and exposes them as **evidence-backed, machine-readable intelligence** — via REST, MCP, and x402.

This repository contains everything a developer needs to go from **zero to first real query in under 5 minutes** — no sales call, no human in the loop.

| Surface | Where |
|---|---|
| REST API | `https://intel.revnuvo.site/v1` — [docs](https://intel.revnuvo.site/docs/api) |
| MCP server (remote) | `https://mcp.revnuvo.site/mcp` — [docs](https://intel.revnuvo.site/docs/mcp) |
| JavaScript SDK | [`revnuvo` on npm](https://www.npmjs.com/package/revnuvo) |
| Python SDK | [`revnuvo-intel` on PyPI](https://pypi.org/project/revnuvo-intel/) |
| Free API key | [app.revnuvo.site](https://app.revnuvo.site) — 100 calls/month, no credit card |
| Machine payments | x402 per call, $0.01 USDC on Base — [docs](https://intel.revnuvo.site/docs/x402) |

## Quickstart

```bash
# 1) get a free key (magic link, 30 seconds)
open https://app.revnuvo.site

# 2) first real query
export REVNUVO_API_KEY=rvk_...
bash examples/01-curl-quickstart.sh

# 3) connect Claude (or any MCP client)
npx revnuvo mcp-config --key "$REVNUVO_API_KEY"
```

Then ask your agent: **"What changed at stripe.com?"** — full walkthrough in [QUICKSTART.md](QUICKSTART.md).

## Examples (`examples/` — every one is runnable)

| File | What it shows |
|---|---|
| `01-curl-quickstart.sh` | Raw REST: whoami → technologies → signals |
| `02-node-monitor.mjs` | Monitor a domain, poll for signals, print evidence |
| `03-python-signals.py` | Python: prospect-scan for companies adopting a technology |
| `04-claude-desktop-config.json` | One-paste Claude Desktop MCP config |
| `05-generic-mcp-client.mjs` | Zero-dependency MCP client (JSON-RPC over HTTP) — works with ANY runtime |
| `06-openai-agents-example.mjs` | OpenAI Agents SDK + Revnuvo MCP tools |
| `07-x402-agent.mjs` | Machine-to-machine access: HTTP 402 → pay USDC on Base → intelligence |

## The 9 canonical capabilities

```
search_company · get_company · get_company_state · get_company_timeline
get_company_technologies · get_company_changes · search_signals
monitor_company · verify_company
```

Every response: deterministic schema, timestamped, confidence-aware, evidence-carrying. Revnuvo reports what was measured — **never purchase intent, never invented data**.

## Positioning

> Revnuvo observes company websites, technologies, DNS and infrastructure over time, detects meaningful changes, and exposes those changes through APIs, MCP and machine-readable signals.

We do not claim predictive buying intent, complete internet coverage, or proprietary AI reasoning. Evidence is the product; your agent does the reasoning.

## For AI agents

- `llms.txt`-style capability map: https://intel.revnuvo.site/llms.txt
- MCP tool descriptions are written for agent discovery — point your client at `https://mcp.revnuvo.site/mcp` with `Authorization: Bearer <key>`
- No account? `POST https://intel.revnuvo.site/v1/x402/company-state` returns an HTTP 402 payment spec (x402 v1, USDC on Base) — pay and query

## Packages

- npm: [revnuvo](https://www.npmjs.com/package/revnuvo) — SDK + CLI (`npx revnuvo whoami`)
- PyPI: [revnuvo-intel](https://pypi.org/project/revnuvo-intel/) — SDK + CLI (`python -m revnuvo_intel whoami`)

## Free tier & pricing

Free Developer: 100 intelligence calls/month (REST + MCP), 3 monitored domains, 7-day history, 10 calls/min — metered and enforced server-side. Upgrade paths are returned in the API response itself (`429` + upgrade URL). Developer $49 · Pro $199 · Agency $499 · x402 $0.01/call.

## "Powered by Revnuvo" (partners)

Embed company intelligence in your agent, CRM or platform with referral attribution and partner pricing: [intel.revnuvo.site/docs/partners](https://intel.revnuvo.site/docs/partners).

## License

MIT — see [LICENSE](LICENSE). Change history in [CHANGELOG.md](CHANGELOG.md).
