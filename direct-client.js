// direct-client.js
const { server, CallToolRequestSchema } = require('./dist/index.js');

async function main() {
  // Find the handler for CallToolRequest
  const handler = server.getRequestHandler(CallToolRequestSchema);

  if (!handler) {
    console.error('Could not find handler for CallToolRequestSchema');
    return;
  }

  // Manually construct the request
  const request = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'seam_analyze_requirements',
      arguments: {
        requirements: 'Create a simple user authentication system with: - User registration with email and password - Login functionality - JWT token generation - Password hashing - Basic user profile management',
      },
    },
    id: '1',
  };

  // Directly invoke the handler
  try {
    const result = await handler(request);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error calling tool:', error);
  }
}

main();
