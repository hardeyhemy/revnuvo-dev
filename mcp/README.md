# Revnuvo MCP — stdio bridge

Speaks MCP over stdio (for desktop clients that don't support remote/streamable-http servers)
and proxies to the production Revnuvo Company Intelligence server at `https://mcp.revnuvo.site/mcp`.

## Run directly (no install)

```bash
REVNUVO_API_KEY=rvk_... node mcp/server.mjs
```

Free key: https://app.revnuvo.site (Free Developer: 100 calls/month, no card).

## Run with Docker

```bash
docker build -t revnuvo-mcp-bridge .
docker run -i -e REVNUVO_API_KEY=rvk_... revnuvo-mcp-bridge
```

## Claude Desktop (stdio)

```json
{
  "mcpServers": {
    "revnuvo": {
      "command": "node",
      "args": ["/path/to/revnuvo-dev/mcp/server.mjs"],
      "env": { "REVNUVO_API_KEY": "rvk_..." }
    }
  }
}
```

Prefer the remote server in Claude Code / other http-capable clients:

```bash
claude mcp add --transport http revnuvo "https://mcp.revnuvo.site/mcp" --header "Authorization: Bearer $REVNUVO_API_KEY"
```

## Behavior

| Method | Without key | With key |
|---|---|---|
| `initialize`, `ping`, `tools/list`, `resources/list`, `prompts/list` | answered (public metadata; offline fallback to embedded snapshot) | answered |
| `tools/call` | honest error pointing to the free-key page | forwarded to the remote, metered on your plan |

No company data is ever served without a key. The bridge holds no state and adds no tracking.
