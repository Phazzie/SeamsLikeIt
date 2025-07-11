#!/bin/bash
# Simple server starter with automatic port finding

echo "🚀 Starting SeamsLikeIt Server..."

# Kill any existing process on port 3000
pkill -f "http-server-secure" || true
sleep 2

# Set environment variables
export NODE_ENV=production
export PORT=${PORT:-3000}

# Build if needed
if [ ! -d "dist" ]; then
    echo "📦 Building project..."
    npm run build
fi

# Start server directly (no PM2)
echo "✅ Server starting on http://localhost:$PORT"
node dist/http-server-secure.js