const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001; // Другой порт чтобы не конфликтовать с основным фронтом

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - User-Agent: ${req.headers['user-agent']}`);
  next();
});

// Отдаём статичные файлы
app.use(express.static(__dirname));

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🧪 TEST MOBILE SERVER                                      ║
╚════════════════════════════════════════════════════════════╝

✅ Server running on:
   - Local:    http://localhost:${PORT}
   - Network:  http://0.0.0.0:${PORT}

📱 На сервере будет доступен по:
   https://dxcapital-ai.com:${PORT}
   (после настройки Nginx)

🔧 Для остановки: Ctrl+C
  `);
});
