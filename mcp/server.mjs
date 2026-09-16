#!/usr/bin/env node
// Revnuvo stdio MCP bridge — speaks MCP over stdio (newline-delimited JSON-RPC 2.0) and
// proxies to the remote Revnuvo Company Intelligence MCP server.
//
// Why this exists:
//   * Some desktop clients (Claude Desktop, older builds) only support stdio servers —
//     this bridge makes Revnuvo usable there.
//   * Directory/container checks (e.g. Glama) run the repo and expect the server to start
//     and answer introspection. Public methods are answered from an embedded snapshot when
//     the remote is unreachable, so `docker run -i <image>` always introspects cleanly.
//
// Methods:
//   initialize / ping / tools/list / resources/list / prompts/list  — answered ALWAYS (from the
//     remote when reachable, else from the embedded snapshot). No API key is ever needed for
//     introspection; a remote failure can never break these.
//   tools/call — forwarded to the remote with REVNUVO_API_KEY (runtime-provided, never committed).
//     Without a key: honest error (never fake data). Tool names are accepted in both the
//     production form (revnuvo_search_company) and the short canonical form (search_company).
//
// Env:
//   REVNUVO_API_KEY   rvk_... (free key: https://app.revnuvo.site — Free Developer: 100 calls/mo)
//   REVNUVO_REMOTE_URL  override remote endpoint (default https://mcp.revnuvo.site/mcp)
//
// Zero dependencies. Node >= 18.

import { createInterface } from "node:readline";

const REMOTE = process.env.REVNUVO_REMOTE_URL || "https://mcp.revnuvo.site/mcp";
const KEY = process.env.REVNUVO_API_KEY || null;
const PROTOCOL_VERSION = "2025-06-18";

// Embedded public-metadata snapshot (mirrors the remote's tool definitions; the remote is
// authoritative at runtime — this is only the offline fallback for introspection checks).
const SNAPSHOT = {
  serverInfo: { name: "revnuvo-company-intelligence", version: "1.0.0" },
  instructions:
    "Revnuvo tells AI agents what changed at a company, with evidence. Start with revnuvo_search_company or revnuvo_get_company_technologies. " +
    "Every result carries a confidence number and evidence strings; absence of a technology means not-detected, never proven-absent. " +
    "Use revnuvo_monitor_company to watch domains for changes. Free tier: 100 calls/month, 1 API key, 10 rpm. " +
    "Keyed callers get full quota semantics; without a key, use x402 per-call payment or get a free key at https://app.revnuvo.site.",
  tools: [
    { name: "revnuvo_search_company", description: "Search known companies by keyword (name or domain fragment). Returns matched domains with observation recency.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Name or domain fragment, e.g. 'hubspot' or 'stripe'" } }, required: ["query"] } },
    { name: "revnuvo_get_company", description: "Company summary for a domain: what we observe, since when, how fresh. Use to decide whether deeper calls are worth it.", inputSchema: { type: "object", properties: { domain: { type: "string", description: "Company domain, e.g. 'stripe.com'" } }, required: ["domain"] } },
    { name: "revnuvo_get_company_state", description: "Latest observed state of a domain (technologies, fingerprint freshness, observation hash) for 'as of now' questions.", inputSchema: { type: "object", properties: { domain: { type: "string", description: "Company domain, e.g. 'hubspot.com'" } }, required: ["domain"] } },
    { name: "revnuvo_get_company_timeline", description: "Chronological change timeline for a domain. Free plan sees the last 7 days.", inputSchema: { type: "object", properties: { domain: { type: "string", description: "Company domain" }, limit: { type: "number", description: "Max events (default 20)" } }, required: ["domain"] } },
    { name: "revnuvo_get_company_technologies", description: "Detected technologies for a domain, each with detection evidence and confidence. Answer 'what does X run on?'.", inputSchema: { type: "object", properties: { domain: { type: "string", description: "Company domain" } }, required: ["domain"] } },
    { name: "revnuvo_get_company_changes", description: "Recent technology/infra changes for a domain with before/after and evidence. Answer 'what changed at X?'.", inputSchema: { type: "object", properties: { domain: { type: "string", description: "Company domain" } }, required: ["domain"] } },
    { name: "revnuvo_search_signals", description: "Cross-company buying/intent signals (e.g. vendor swaps, new tooling) ranked by score, with evidence. Free plan: last 7 days.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Signal keyword, e.g. 'migrated from' or a technology name" }, limit: { type: "number", description: "Max signals (default 10)" } }, required: ["query"] } },
    { name: "revnuvo_monitor_company", description: "Watch a domain for changes; a baseline scan is captured immediately and rechecks run on schedule. Requires a webhooks-capable plan for delivery.", inputSchema: { type: "object", properties: { domain: { type: "string", description: "Company domain to monitor" } }, required: ["domain"] } },
    { name: "revnuvo_verify_company", description: "On-demand verification pass of a domain (live HTTP + DNS evidence). Use to confirm a signal before acting on it.", inputSchema: { type: "object", properties: { domain: { type: "string", description: "Company domain to verify" } }, required: ["domain"] } },
  ],
};

const PUBLIC = new Set(["initialize", "ping", "tools/list", "resources/list", "prompts/list"]);

// Canonical short names -> production tool names. The nine Revnuvo capabilities are callable
// under either form; tools/list mirrors the production contract (revnuvo_*).
const CANONICAL = new Set(SNAPSHOT.tools.map((t) => t.name));
const ALIASES = Object.fromEntries(
  SNAPSHOT.tools.map((t) => [t.name.replace(/^revnuvo_/, ""), t.name])
);

function normalizeToolCall(msg) {
  if (msg?.method !== "tools/call") return msg;
  const name = msg.params?.name;
  if (typeof name === "string" && !CANONICAL.has(name) && ALIASES[name]) {
    return { ...msg, params: { ...msg.params, name: ALIASES[name] } };
  }
  return msg;
}

const err = (id, code, message, data) => ({ jsonrpc: "2.0", id, error: { code, message, ...(data ? { data } : {}) } });
const ok = (id, result) => ({ jsonrpc: "2.0", id, result });

function staticAnswer(msg) {
  const { id, method } = msg;
  if (method === "initialize") {
    return ok(id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: { listChanged: false } },
      serverInfo: SNAPSHOT.serverInfo,
      instructions: SNAPSHOT.instructions,
    });
  }
  if (method === "ping") return ok(id, {});
  if (method === "tools/list") return ok(id, { tools: SNAPSHOT.tools });
  if (method === "resources/list") return ok(id, { resources: [] });
  if (method === "prompts/list") return ok(id, { prompts: [] });
  return err(id, -32601, `method not supported: ${method}`);
}

async function forward(msg) {
  // Returns: null        -> notification accepted remotely (no body)
  //          object/array -> valid JSON-RPC response payload
  //          undefined    -> remote unreachable or returned a non-JSON-RPC body (caller falls back)
  const headers = { "content-type": "application/json", accept: "application/json, text/event-stream" };
  if (KEY) headers.authorization = `Bearer ${KEY}`;
  let res;
  try {
    res = await fetch(REMOTE, { method: "POST", headers, body: JSON.stringify(msg) });
  } catch {
    return undefined; // network unreachable
  }
  if (res.status === 202) return null;
  const text = await res.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { return undefined; }
  const shaped = (o) => o && typeof o === "object" && o.jsonrpc === "2.0" && ("result" in o || "error" in o);
  if (Array.isArray(parsed)) return parsed.every(shaped) ? parsed : undefined;
  return shaped(parsed) ? parsed : undefined;
}

async function handle(msg) {
  if (Array.isArray(msg)) {
    const out = [];
    for (const m of msg) {
      const r = await handle(m);
      if (r) out.push(r);
    }
    return out.length ? out : null;
  }
  if (!msg || typeof msg !== "object" || typeof msg.method !== "string") {
    return err(msg?.id ?? null, -32600, "invalid JSON-RPC request");
  }
  const { id, method } = msg;
  const isNotification = id === undefined || id === null;
  msg = normalizeToolCall(msg);

  if (method === "tools/call" && !KEY) {
    if (isNotification) return null;
    return err(id, -32002,
      "REVNUVO_API_KEY is not set. Get a free key at https://app.revnuvo.site (Free Developer: 100 calls/month, no card), then set it and restart the bridge.",
      { how: "docker build -t revnuvo-mcp-bridge . && docker run -i -e REVNUVO_API_KEY=rvk_... revnuvo-mcp-bridge" });
  }

  try {
    const remoteRes = await forward(msg);
    if (remoteRes === null) return null;          // notification accepted, no body
    if (remoteRes !== undefined) {
      // Guarantee: public introspection never fails, whatever the remote's auth state is.
      if (PUBLIC.has(method) && !Array.isArray(remoteRes) && remoteRes.error) return staticAnswer(msg);
      return remoteRes;                            // valid JSON-RPC from remote
    }
    if (isNotification) return null;
    if (PUBLIC.has(method)) return staticAnswer(msg);
    return err(id, -32000, "remote server returned an unreadable response");
  } catch (e) {
    // Safety net (forward() already guards): public introspection still answered offline.
    if (isNotification) return null;
    if (PUBLIC.has(method)) return staticAnswer(msg);
    if (method === "tools/call") return err(id, -32000, `remote Revnuvo server unreachable: ${String(e.message || e).slice(0, 160)}`);
    return err(id, -32601, `method not supported: ${method}`);
  }
}

const write = (s) => process.stdout.write(s + "\n");
// Track in-flight async handlers so stdin close doesn't kill forwarded requests mid-flight.
let pending = 0, closed = false;
const maybeExit = () => { if (closed && pending === 0) process.exit(0); };
const rl = createInterface({ input: process.stdin, terminal: false });
rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let msg;
  try { msg = JSON.parse(trimmed); } catch { write(JSON.stringify(err(null, -32700, "parse error: invalid JSON"))); return; }
  pending++;
  try {
    const out = await handle(msg);
    if (out !== null && out !== undefined) write(JSON.stringify(out));
  } catch (e) {
    const id = Array.isArray(msg) ? null : msg?.id ?? null;
    write(JSON.stringify(err(id, -32603, `internal error: ${String(e.message || e).slice(0, 160)}`)));
  } finally {
    pending--;
    maybeExit();
  }
});
rl.on("close", () => { closed = true; maybeExit(); });
// Safety net: never hang forever waiting on a wedged socket (10s after stdin close).
rl.on("close", () => setTimeout(() => process.exit(0), 10000).unref());
