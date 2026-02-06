module.exports = {
  apps: [
    {
      name: 'dxcapai-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      
      instances: 1,
      exec_mode: 'fork',
      
      // ✅ ОБНОВЛЕНО: новый путь
      cwd: '/home/dxdx-repo/frontend',
      
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://dxcapital-ai.com/api'
      },
      
      max_memory_restart: '2G',
      min_uptime: '10s',
      max_restarts: 10,
      
      // ✅ ОБНОВЛЕНО: новые пути логов
      log_file: '/home/dxdx-repo/frontend/logs/dxcapai.log',
      out_file: '/home/dxdx-repo/frontend/logs/dxcapai-out.log',
      error_file: '/home/dxdx-repo/frontend/logs/dxcapai-error.log',
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