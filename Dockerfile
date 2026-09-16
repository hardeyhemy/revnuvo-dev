FROM node:22-alpine
WORKDIR /app
COPY mcp/server.mjs ./server.mjs
# Public introspection works with no key; tools/call needs REVNUVO_API_KEY at runtime.
ENV NODE_ENV=production
CMD ["node", "server.mjs"]
