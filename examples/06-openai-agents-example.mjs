// OpenAI Agents SDK + Revnuvo MCP tools.
// npm i agents @openai/openai-agents  ·  export OPENAI_API_KEY=... REVNUVO_API_KEY=rvk_...
// Pattern per OpenAI "Agents SDK — MCP servers" docs: connect a remote MCP server
// (streamable http), the agent discovers revnuvo_* tools automatically from their
// descriptions and calls them for company-intelligence questions.
import { Agent, run } from "@openai/openai-agents";
// MCP connection helper name varies by SDK version; conceptually:
import { MCPServerStreamableHttp } from "@openai/openai-agents";

const mcpServer = new MCPServerStreamableHttp({
  url: "https://mcp.revnuvo.site/mcp",
  headers: { Authorization: `Bearer ${process.env.REVNUVO_API_KEY}` },
  name: "revnuvo",
});

const agent = new Agent({
  name: "Company Intelligence Agent",
  instructions:
    "You research companies. Use the revnuvo_* tools for any question about a company's " +
    "technology stack, infrastructure or observed changes. Revnuvo returns evidence-backed " +
    "observations — cite the evidence and timestamps in your answers. Never infer purchase " +
    "intent from observation data alone.",
  mcpServers: [mcpServer],
});

const result = await run(agent, "What technologies does hubspot.com use, and what changed there recently?");
console.log(result.finalOutput);
