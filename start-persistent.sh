#!/bin/bash

# Quick start script for persistent SeamsLikeIt server

echo "🚀 Starting SeamsLikeIt Server in persistent mode..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Installing PM2..."
    npm install -g pm2
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Stop any existing instances
echo "Stopping any existing instances..."
pm2 stop seamslikeit-http 2>/dev/null || true

# Build the project
echo "Building project..."
npm run build

# Start with PM2
echo "Starting server with PM2..."
pm2 start ecosystem.config.js --only seamslikeit-http

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

# Show status
echo ""
echo "✅ Server started successfully!"
echo ""
pm2 status

echo ""
echo "📝 Useful commands:"
echo "  pm2 logs seamslikeit-http    # View logs"
echo "  pm2 restart seamslikeit-http # Restart server"
echo "  pm2 stop seamslikeit-http    # Stop server"
echo "  pm2 monit                    # Monitor CPU/Memory"
echo ""
echo "🔗 Access points:"
echo "  HTTP API: http://localhost:3000"
echo "  Health Check: http://localhost:3000/health"
echo "  WebSocket: ws://localhost:3000"
echo ""
echo "🔐 Default credentials:"
echo "  Username: demo"
echo "  Password: demo123"
echo ""
echo "To make server start on boot:"
echo "  pm2 startup"
echo "  # Then follow the instructions"