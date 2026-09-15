// Zero-dependency generic MCP client for Revnuvo — JSON-RPC 2.0 over Streamable HTTP.
// Usage: REVNUVO_API_KEY=rvk_... node 05-generic-mcp-client.mjs
// Works on Node 18+/Bun/Deno (fetch required). Demonstrates the wire protocol
// exactly as any MCP client would drive it.
const BASE = "https://mcp.revnuvo.site/mcp";
const KEY = process.env.REVNUVO_API_KEY;
if (!KEY) { console.error("export REVNUVO_API_KEY=rvk_... (free: https://app.revnuvo.site)"); process.exit(1); }

async function rpc(body) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${KEY}` },
    body: JSON.stringify(body),
  });
  if (res.status === 204 || res.status === 202) return null;
  return res.json();
}

// 1) initialize handshake
const init = await rpc({ jsonrpc: "2.0", id: 1, method: "initialize",
  params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "revnuvo-example", version: "1.0.0" } } });
console.log("server:", init.result.serverInfo.name, "· protocol:", init.result.protocolVersion);
await rpc({ jsonrpc: "2.0", method: "notifications/initialized" });

// 2) list tools
const tools = await rpc({ jsonrpc: "2.0", id: 2, method: "tools/list" });
console.log("tools:", tools.result.tools.map((t) => t.name).join(", "));

// 3) first real query — company technologies with evidence
const call = await rpc({ jsonrpc: "2.0", id: 3, method: "tools/call",
  params: { name: "revnuvo_get_company_technologies", arguments: { domain: "hubspot.com" } } });
const out = call.result.structuredContent;
console.log(`\n${out.domain} technologies (observed ${out.observed_at}):`);
for (const t of out.technologies) console.log(`  ${t.name} [${t.category}] conf=${t.confidence} evidence=${t.evidence}`);

// 4) signal search — which companies recently added a technology?
const sig = await rpc({ jsonrpc: "2.0", id: 4, method: "tools/call",
  params: { name: "revnuvo_search_signals", arguments: { event_type: "technology_added", limit: 5 } } });
console.log(`\nrecent technology_added signals: ${sig.result.structuredContent.count}`);
for (const s of sig.result.structuredContent.signals) console.log(`  ${s.domain} → ${s.technology} (score ${s.signal_score})`);
