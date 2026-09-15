#!/usr/bin/env bash
# Revnuvo quickstart — raw REST, no dependencies.
# Usage: REVNUVO_API_KEY=rvk_... bash 01-curl-quickstart.sh
set -euo pipefail
BASE="https://intel.revnuvo.site/v1"
AUTH="Authorization: Bearer ${REVNUVO_API_KEY:?export REVNUVO_API_KEY=rvk_... (free key: https://app.revnuvo.site)}"

echo "== 1) whoami (key + quota)"
curl -sf "$BASE/whoami" -H "$AUTH" | python3 -m json.tool

echo "== 2) technologies at hubspot.com (with evidence)"
curl -sf "$BASE/companies/hubspot.com/technologies" -H "$AUTH" | python3 -m json.tool

echo "== 3) latest technology_added signals across observed companies"
curl -sf "$BASE/signals?event_type=technology_added&limit=5" -H "$AUTH" | python3 -m json.tool

echo "Next: bash 02-node-monitor.mjs  ·  or connect MCP: https://intel.revnuvo.site/docs/mcp"
