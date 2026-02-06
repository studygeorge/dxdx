module.exports = {
  apps: [
    {
      name: 'dxcapai',
      // ✅ ВЕРНУЛИ: обычный next start
      script: 'node_modules/.bin/next',
      args: 'start',
      
      instances: 1,
      exec_mode: 'fork',
      
      cwd: '/home/dxcapai-app',
      
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      max_memory_restart: '2G',
      min_uptime: '10s',
      max_restarts: 10,
      
      log_file: '/home/dxcapai-app/logs/dxcapai.log',
      out_file: '/home/dxcapai-app/logs/dxcapai-out.log',
      error_file: '/home/dxcapai-app/logs/dxcapai-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      wait_ready: false,
      watch: false,
      
      kill_timeout: 5000,
      listen_timeout: 10000,
      
      autorestart: true,
      
      ignore_watch: [
        'node_modules',
        'logs',
        '.next',
        '.git'
      ]
    }
  ]
}