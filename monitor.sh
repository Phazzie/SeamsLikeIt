#!/bin/bash

# Simple monitoring script for SeamsLikeIt server
# Can be added to cron for regular checks

URL="http://localhost:3000/health"
LOG_FILE="logs/monitor.log"

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check if server is responding
if curl -f -s "$URL" > /dev/null; then
    HEALTH=$(curl -s "$URL")
    UPTIME=$(echo "$HEALTH" | jq -r '.uptime' 2>/dev/null || echo "unknown")
    MEMORY=$(echo "$HEALTH" | jq -r '.memory.heapUsed' 2>/dev/null || echo "unknown")
    
    log "✅ Server is healthy - Uptime: ${UPTIME}s, Memory: ${MEMORY} bytes"
else
    log "❌ Server is down or not responding!"
    
    # Try to restart with PM2
    if command -v pm2 &> /dev/null; then
        log "Attempting to restart with PM2..."
        pm2 restart seamslikeit-http
        
        # Wait a moment and check again
        sleep 5
        if curl -f -s "$URL" > /dev/null; then
            log "✅ Server restarted successfully"
        else
            log "❌ Failed to restart server"
        fi
    fi
fi

# Optional: Send alerts (uncomment and configure)
# if server is down; then
#     mail -s "SeamsLikeIt Server Alert" admin@example.com < "$LOG_FILE"
# fi