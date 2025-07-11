# Solution for Gemini MCP Connection

## The Issue

You're trying to use the MCP SDK as a command-line client, but the `@modelcontextprotocol/sdk` package doesn't provide a CLI tool - it's a library for building MCP servers and clients programmatically.

## The Solutio

### Option 1: Use the HTTP API Instead (Recommended)

The SeamsLikeIt server also has an HTTP interface! This is much easier for testing:

```bash
# Start the HTTP server (instead of stdio server)
cd /mnt/c/Users/thump/TextymcVoiceface/mcp-server
npm run http:secure
```

This starts the server on `http://localhost:3000`

Then you can call tools via HTTP:

```bash
# Login first to get a token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "demo123"}'

# Use the token to call tools
curl -X POST http://localhost:3000/tools/seam_analyze_requirements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"requirements": "Build an online bookstore"}'
```

### Option 2: Create a Simple Node.js Client

Since there's no CLI tool, you need to create a client. Here's a minimal example:

Create a file `/mnt/c/Users/thump/TextymcVoiceface/mcp-server/test-client.js`:

```javascript
const { spawn } = require("child_process");

// Start the server
const server = spawn("node", ["dist/index.js"], {
  stdio: ["pipe", "pipe", "pipe"],
  env: { ...process.env, OPENAI_API_KEY: process.env.OPENAI_API_KEY },
});

// Send a request
const request = {
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    name: "seam_analyze_requirements",
    arguments: {
      requirements: "Build an online bookstore",
    },
  },
  id: 1,
};

server.stdin.write(JSON.stringify(request) + "\n");

// Read response
server.stdout.on("data", (data) => {
  console.log("Response:", data.toString());
});

server.stderr.on("data", (data) => {
  console.error("Error:", data.toString());
});
```

Then run: `node test-client.js`

### Option 3: Use the Test HTML Interface

Open `/mnt/c/Users/thump/TextymcVoiceface/mcp-server/test-remote-secure.html` in a browser. It provides a full UI for testing all the tools!

## Why This Happens

MCP (Model Context Protocol) is designed for AI assistants to spawn and communicate with servers automatically. It's not meant for manual command-line usage. The protocol uses JSON-RPC over stdio, which requires a proper client implementation.

## Recommendation

Use **Option 1 (HTTP API)** for now. It's the easiest way to test the tools and doesn't require implementing a stdio client. The HTTP server provides the exact same functionality as the MCP server, just with a different transport.

## Quick Test

```bash
# Terminal 1: Start HTTP server
cd /mnt/c/Users/thump/TextymcVoiceface/mcp-server
npm run http:secure

# Terminal 2: Test a tool
curl -X POST http://localhost:3000/tools/seam_analyze_requirements \
  -H "Content-Type: application/json" \
  -H "X-API-Key: development-key" \
  -d '{"requirements": "Build a task management app"}'
```

This should return a JSON response with components and seams!
