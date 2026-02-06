module.exports = {
  apps: [
    // ✅ Backend API Server (Fastify)
    {
      name: 'dxcapai-backend',
      script: 'dist/server.js',
      
      // ✅ ОБНОВЛЕНО: новый путь
      cwd: '/home/dxdx-repo/backend',
      
      instances: 1,
      exec_mode: 'cluster',
      
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      
      // ✅ Загрузка .env файла
      env_file: './.env',
      
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      
      // ✅ Логи (относительные пути от cwd)
      log_file: './logs/backend.log',
      out_file: './logs/backend-out.log',
      error_file: './logs/backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      watch: false,
      autorestart: true,
      
      kill_timeout: 5000,
      wait_ready: false,
      
      // ✅ Graceful shutdown
      listen_timeout: 10000,
      shutdown_with_message: true
    },
    
    // ✅ Telegram Bot (опционально, если хотите отдельно)
    {
      name: 'dxcapai-telegram-bot',
      script: 'dist/bot/telegram-bot.js',
      
      cwd: '/home/dxdx-repo/backend',
      
      instances: 1,
      exec_mode: 'fork',
      
      env: {
        NODE_ENV: 'production'
      },
      
      env_file: './.env',
      
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 10,
      
      log_file: './logs/telegram-bot.log',
      out_file: './logs/telegram-bot-out.log',
      error_file: './logs/telegram-bot-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      watch: false,
      autorestart: true,
      
      kill_timeout: 5000
    }
  ]
};
