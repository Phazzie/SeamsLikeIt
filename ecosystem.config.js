module.exports = {
  apps: [{
    name: 'seamslikeit-http',
    script: 'npm',
    args: 'run http:secure',
    cwd: __dirname,
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
    time: true,
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }, {
    name: 'seamslikeit-mcp',
    script: 'node',
    args: 'dist/index.js',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    log_file: './logs/mcp-combined.log',
    error_file: './logs/mcp-error.log',
    out_file: './logs/mcp-out.log',
    time: true
  }]
};