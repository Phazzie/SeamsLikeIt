#!/bin/bash

echo "🚀 Starting SDD Secure Server..."
echo ""

# Check if JWT_SECRET is set
if [ -z "$JWT_SECRET" ]; then
  echo "⚠️  WARNING: JWT_SECRET not set. Using development secret."
  echo "   For production, set: export JWT_SECRET='your-secret-here'"
  export JWT_SECRET="dev-secret-change-in-production"
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Start the secure server
echo ""
echo "🎯 Starting secure HTTP server with:"
echo "   - JWT Authentication"
echo "   - Rate Limiting"
echo "   - WebSocket Progress Tracking"
echo "   - Cost Tracking"
echo "   - XSS Protection"
echo ""

npm run http:secure