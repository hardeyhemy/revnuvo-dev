# Revnuvo in 10 minutes

Zero-to-first-real-query, no human contact required.

## 0. What you need

- An email address (for a magic link)
- curl, Node 18+, or Python 3.9+ (pick one)

## 1. Get a free API key (30 seconds)

1. Go to **https://app.revnuvo.site**
2. Enter your email → click **Continue with email** → click the link in your inbox
3. Go to **Settings → API keys** → **Create key**
4. Copy the key (`rvk_xxxxxxxx_yyyy...`) — it is shown **once**

Free Developer tier: **100 intelligence calls/month**, 3 monitored domains, 7-day history. Metered server-side. No credit card.

## 2. First query — pick your stack

### curl

```bash
export REVNUVO_API_KEY=rvk_...

# verify your key + quota
curl -s https://intel.revnuvo.site/v1/whoami -H "Authorization: Bearer $REVNUVO_API_KEY"

# what technologies does hubspot.com use? (with evidence)
curl -s https://intel.revnuvo.site/v1/companies/hubspot.com/technologies \
  -H "Authorization: Bearer $REVNUVO_API_KEY" | python3 -m json.tool
```

### JavaScript

```bash
npm install revnuvo
```

```js
import { Revnuvo } from "revnuvo";
const rv = new Revnuvo({ apiKey: process.env.REVNUVO_API_KEY });
console.log((await rv.whoami()).quota);                  // { used: 0, api_calls_per_month: 100, ... }
console.log((await rv.getCompanyTechnologies("vercel.com")).technologies);
```

### Python

```bash
pip install revnuvo-intel
```

```python
import os
from revnuvo_intel import Revnuvo

rv = Revnuvo(api_key=os.environ["REVNUVO_API_KEY"])
print(rv.whoami()["quota"])
print(rv.get_company_state("nekuda.ai")["state"]["technologies"])
```

## 3. The first *useful* query — change signals

```bash
curl -s "https://intel.revnuvo.site/v1/signals?event_type=technology_added&limit=10" \
  -H "Authorization: Bearer $REVNUVO_API_KEY"
```

Each signal carries: `domain`, `technology`, `previous_state`, `new_state`, `confidence`, `signal_score` (1-100), `reason_codes`, `evidence` (what was actually matched), `detected_at`.

> ⚠️ These are **observed changes with evidence** — not predictions of buying intent. Your agent does the reasoning; Revnuvo provides the external-world observation.

## 4. Monitor a company (signals flow to you)

```bash
curl -s -X POST https://intel.revnuvo.site/v1/monitor \
  -H "Authorization: Bearer $REVNUVO_API_KEY" -H "content-type: application/json" \
  -d '{"domain":"acme.com","interval_hours":24}'
# → 201, immediate baseline scan
```

Get changes later: `GET /v1/companies/acme.com/changes` · or configure **webhook/email delivery** in the [dashboard](https://app.revnuvo.site).

## 5. Connect an AI agent (MCP)

### Claude Code

```bash
claude mcp add --transport http revnuvo "https://mcp.revnuvo.site/mcp" \
  --header "Authorization: Bearer $REVNUVO_API_KEY"
```

### Claude Desktop

Paste into `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "revnuvo": {
      "url": "https://mcp.revnuvo.site/mcp",
      "headers": { "Authorization": "Bearer rvk_YOUR_KEY" }
    }
  }
}
```

Then ask: *"What changed at stripe.com?"*, *"Which companies recently adopted Vue?"*, *"Monitor acme.com and tell me when its stack changes."*

Tool list + protocol details: [intel.revnuvo.site/docs/mcp](https://intel.revnuvo.site/docs/mcp)

## 6. When you hit the free limit

The API tells you, in the response, exactly what to do:

```json
{ "code": "monthly_quota_exhausted", "used": 100, "quota": 100,
  "upgrade": "https://app.revnuvo.site/upgrade",
  "x402_per_call": "POST /v1/x402/company-state" }
```

- **Developer $49/mo** → 1,000 calls, 6h checks, webhooks
- **x402** → pay per call ($0.01, USDC on Base), no account at all

## Troubleshooting

| Symptom | Meaning | Fix |
|---|---|---|
| `401` | key bad/revoked | create a new key in Settings |
| `404 not_observed` | we never scanned that domain | `POST /v1/monitor` first — we scan immediately |
| `429 rate_limit_exceeded` | >10 calls/min on free | back off 60s or upgrade |
| `429 monthly_quota_exhausted` | 100/100 calls used | upgrade or x402 |
| empty `signals` | no changes detected yet (honest zero) | add domains, wait for the next scan cycle |

More: [API reference](https://intel.revnuvo.site/docs/api) · [QUICKSTART examples](examples/) · [Partners](https://intel.revnuvo.site/docs/partners)
