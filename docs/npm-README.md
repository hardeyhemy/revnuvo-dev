# revnuvo

**Give AI agents live intelligence about companies.**

Official JavaScript SDK for the [Revnuvo Company Intelligence API](https://intel.revnuvo.site). Revnuvo observes company websites, technologies, DNS and infrastructure over time, detects meaningful changes, and returns **evidence-backed, machine-readable intelligence** — timestamped, confidence-aware, never invented.

- 🆓 **Free developer tier**: 100 intelligence calls/month (REST + MCP), no credit card → [get a key](https://app.revnuvo.site/?ref=npm)
- 🔌 **MCP included**: one config line connects Claude/any MCP client → [MCP docs](https://intel.revnuvo.site/docs/mcp)
- ⚡ **Zero dependencies**, works in Node 18+, Bun, Deno, edge runtimes
- 💸 **x402 support**: agents without accounts pay per call in USDC on Base → [x402 docs](https://intel.revnuvo.site/docs/x402)

## Install

```bash
npm install revnuvo
```

## 60-second quickstart

```js
import { Revnuvo } from "revnuvo";

const rv = new Revnuvo({ apiKey: process.env.REVNUVO_API_KEY });

// What technologies does this company use? (with evidence)
const techs = await rv.getCompanyTechnologies("hubspot.com");
console.log(techs.technologies);
// [{ name: "webflow", confidence: 0.85, evidence: "meta generator", ... }, ...]

// What changed at this company?
const changes = await rv.getCompanyChanges("stripe.com");
console.log(changes.changes);

// Which companies recently adopted Vue?
const signals = await rv.searchSignals({ technology: "vue", eventType: "technology_added" });
console.log(signals.signals);
// each signal: before/after state, evidence, confidence, signal_score, detected_at
```

## The 9 canonical capabilities

| Method | Answers |
|---|---|
| `searchCompanies({query})` | Which companies does Revnuvo observe? |
| `getCompany(domain)` | What do we know about this company? |
| `getCompanyState(domain)` | Full current observed state (HTTP + techs + scripts + DNS) |
| `getCompanyTimeline(domain)` | How did their stack evolve? |
| `getCompanyTechnologies(domain)` | What technologies do they use? (evidence per tech) |
| `getCompanyChanges(domain)` | What changed and when? |
| `searchSignals({technology,...})` | Which companies recently adopted X? |
| `monitorCompany(domain)` | Watch this company for future changes |
| `verifyCompany(domain)` | What can be substantiated with evidence? |

Plus `whoami()` — your key's identity and remaining quota.

## MCP (Claude, Cursor, any MCP client)

```js
import { claudeDesktopConfig } from "revnuvo";
console.log(JSON.stringify(claudeDesktopConfig(process.env.REVNUVO_API_KEY), null, 2));
```

Paste into `claude_desktop_config.json`, then ask Claude: *"What changed at stripe.com?"* — full instructions: [intel.revnuvo.site/docs/mcp](https://intel.revnuvo.site/docs/mcp).

## CLI

```bash
npx revnuvo whoami                 # key + quota
npx revnuvo tech hubspot.com      # detected technologies + evidence
npx revnuvo changes stripe.com    # observed changes
npx revnuvo monitor acme.com      # start monitoring
npx revnuvo mcp-config --key ...  # print MCP config
```

## Error handling

```js
import { Revnuvo, RevnuvoError } from "revnuvo";

try {
  await rv.getCompanyState("example.com");
} catch (e) {
  if (e instanceof RevnuvoError) {
    e.status; // 401 bad key · 404 not_observed · 429 quota/rate limit · 402 plan limit
    e.code;   // "monthly_quota_exhausted", "not_observed", "plan_limit", ...
  }
}
```

Quota exhausted? The error tells you exactly where to upgrade (no "contact sales" wall), and agents can pay per call via [x402](https://intel.revnuvo.site/docs/x402).

## Honesty

Revnuvo reports **what was measured** — observed technologies, infrastructure and changes with timestamps, confidence and evidence. It does **not** claim purchase intent, complete internet coverage, or predictive conclusions. Evidence is the product.

## Links

- [Quickstart](https://intel.revnuvo.site) · [API reference](https://intel.revnuvo.site/docs/api) · [MCP](https://intel.revnuvo.site/docs/mcp) · [Claude setup](https://intel.revnuvo.site/docs/claude)
- Python: [`revnuvo-intel` on PyPI](https://pypi.org/project/revnuvo-intel/)
- Dashboard / free key: [app.revnuvo.site](https://app.revnuvo.site/?ref=npm)

## License

MIT
