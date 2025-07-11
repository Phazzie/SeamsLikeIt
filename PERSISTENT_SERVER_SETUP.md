# Making SeamsLikeIt Server Persistent

## Option 1: PM2 (Process Manager) - Recommended

PM2 is a production process manager that keeps your app running forever.

### Installation
```bash
npm install -g pm2
```

### Setup
```bash
# Start the HTTP server with PM2
pm2 start npm --name "seamslikeit-http" -- run http:secure

# Or start with a config file (create ecosystem.config.js first)
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions it gives you
```

### Create ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'seamslikeit-http',
    script: 'npm',
    args: 'run http:secure',
    cwd: '/mnt/c/Users/thump/TextymcVoiceface/mcp-server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/combined.log',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    time: true
  }]
};
```

### PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs seamslikeit-http

# Restart
pm2 restart seamslikeit-http

# Stop
pm2 stop seamslikeit-http

# Monitor CPU/Memory
pm2 monit
```

## Option 2: systemd Service (Linux/WSL)

Create a systemd service for automatic startup.

### Create service file
```bash
sudo nano /etc/systemd/system/seamslikeit.service
```

### Add this content:
```ini
[Unit]
Description=SeamsLikeIt MCP Server
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/mnt/c/Users/thump/TextymcVoiceface/mcp-server
ExecStart=/usr/bin/node /mnt/c/Users/thump/TextymcVoiceface/mcp-server/dist/http-server-secure.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/seamslikeit/output.log
StandardError=append:/var/log/seamslikeit/error.log

Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

### Enable and start
```bash
# Create log directory
sudo mkdir -p /var/log/seamslikeit
sudo chown YOUR_USERNAME:YOUR_USERNAME /var/log/seamslikeit

# Enable service
sudo systemctl enable seamslikeit.service

# Start service
sudo systemctl start seamslikeit.service

# Check status
sudo systemctl status seamslikeit.service

# View logs
sudo journalctl -u seamslikeit.service -f
```

## Option 3: Docker Container

Create a containerized version for ultimate portability.

### Create Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built files
COPY dist/ ./dist/
COPY .env ./

# Expose port
EXPOSE 3000

# Run the server
CMD ["node", "dist/http-server-secure.js"]
```

### Create docker-compose.yml
```yaml
version: '3.8'

services:
  seamslikeit:
    build: .
    container_name: seamslikeit-server
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Run with Docker
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Option 4: Windows Service (If on Windows)

### Using node-windows
```bash
npm install -g node-windows

# Create service installer script: install-service.js
```

```javascript
const Service = require('node-windows').Service;

const svc = new Service({
  name: 'SeamsLikeIt Server',
  description: 'MCP Server for Seam-Driven Development',
  script: 'C:\\Users\\thump\\TextymcVoiceface\\mcp-server\\dist\\http-server-secure.js',
  env: [{
    name: "NODE_ENV",
    value: "production"
  }, {
    name: "PORT",
    value: "3000"
  }]
});

svc.on('install', () => {
  svc.start();
  console.log('Service installed and started');
});

svc.install();
```

## Option 5: Forever (Simple Node.js Solution)

```bash
# Install forever
npm install -g forever

# Start server
forever start --uid "seamslikeit" -a -l forever.log -o out.log -e err.log dist/http-server-secure.js

# List running processes
forever list

# Stop
forever stop seamslikeit

# Restart
forever restart seamslikeit
```

## Option 6: Screen/Tmux (Quick & Dirty)

For development or quick persistence:

```bash
# Using screen
screen -S seamslikeit
npm run http:secure
# Detach with Ctrl+A, D

# Reattach
screen -r seamslikeit

# Using tmux
tmux new -s seamslikeit
npm run http:secure
# Detach with Ctrl+B, D

# Reattach
tmux attach -t seamslikeit
```

## Adding Health Checks

Add a health endpoint to http-server-secure.ts:

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});
```

## Monitoring & Alerts

### With PM2
```bash
# Install PM2 web monitoring
pm2 install pm2-logrotate
pm2 install pm2-auto-pull

# Setup keymetrics.io for cloud monitoring (optional)
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
```

### Custom monitoring script
```bash
#!/bin/bash
# monitor.sh - Add to cron

URL="http://localhost:3000/health"
SLACK_WEBHOOK="YOUR_SLACK_WEBHOOK_URL"

if ! curl -f -s "$URL" > /dev/null; then
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"⚠️ SeamsLikeIt server is down!"}' \
    "$SLACK_WEBHOOK"
fi
```

## Nginx Reverse Proxy (Production)

```nginx
server {
    listen 80;
    server_name seamslikeit.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Backup Strategy

### Automated backups with cron
```bash
# Add to crontab -e
0 2 * * * /home/user/backup-seamslikeit.sh

# backup-seamslikeit.sh
#!/bin/bash
BACKUP_DIR="/backup/seamslikeit"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup code and data
tar -czf "$BACKUP_DIR/seamslikeit_$DATE.tar.gz" \
  /mnt/c/Users/thump/TextymcVoiceface/mcp-server \
  --exclude='node_modules' \
  --exclude='dist'

# Keep only last 7 days
find "$BACKUP_DIR" -name "seamslikeit_*.tar.gz" -mtime +7 -delete
```

## Environment-Specific Configs

### Create .env.production
```env
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=your_production_key
LOG_LEVEL=info
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900000
```

### Update package.json scripts
```json
{
  "scripts": {
    "start:prod": "NODE_ENV=production node dist/http-server-secure.js",
    "pm2:start": "pm2 start ecosystem.config.js",
    "pm2:stop": "pm2 stop all",
    "pm2:restart": "pm2 restart all",
    "pm2:logs": "pm2 logs"
  }
}
```

## Quick Start Commands

```bash
# Option 1: PM2 (Recommended)
npm install -g pm2
pm2 start npm --name seamslikeit -- run http:secure
pm2 save
pm2 startup

# Option 2: Forever
npm install -g forever
forever start -a -l forever.log dist/http-server-secure.js

# Option 3: Docker
docker-compose up -d

# Option 4: Quick dev persistence
screen -S seamslikeit
npm run http:secure
# Ctrl+A, D to detach
```

## Choosing the Right Option

- **Development**: Screen/Tmux or PM2
- **Production**: PM2 with Nginx or Docker
- **Windows**: node-windows service or PM2
- **Cloud**: Docker with orchestration (Kubernetes, ECS)
- **Simple**: Forever or PM2

The server will now run persistently even after closing your terminal!