module.exports = {
  apps: [
    // Бэкенд (ваш существующий сервис)
    {
      name: 'dxcapai-backend',
      script: 'dist/server.js',
      cwd: '/home/dxcapai-backend', // Корень проекта
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      env_file: './.env', // Подгружаем .env из корня
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 10,
      log_file: './logs/backend.log',
      out_file: './logs/backend-out.log',
      error_file: './logs/backend-error.log',
      watch: false,
      kill_timeout: 5000,
      wait_ready: false
    }
    
    
  ]
};
