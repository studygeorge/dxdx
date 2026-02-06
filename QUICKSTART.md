# 🚀 QUICK START - Что делать на сервере

## ⚡ БЫСТРЫЙ ДЕПЛОЙ (3 команды)

```bash
# 1. Скопировать Nginx конфиг
sudo cp /home/dxdx-repo/nginx-dxcapital.conf /etc/nginx/sites-available/dxcapital-ai.com
sudo ln -sf /etc/nginx/sites-available/dxcapital-ai.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 2. Сделать deploy.sh исполняемым
chmod +x /home/dxdx-repo/deploy.sh

# 3. Запустить деплой
cd /home/dxdx-repo && ./deploy.sh
```

---

## 📋 ЧТО ДЕЛАЕТ deploy.sh:

1. ✅ **Git pull** - Получает последние изменения
2. ✅ **Frontend build** - Собирает Next.js (`npm install` + `npm run build`)
3. ✅ **Backend build** - Собирает TypeScript (`npm install` + `npx prisma generate` + `npm run build`)
4. ✅ **PM2 restart** - Перезапускает оба сервиса
5. ✅ **Nginx reload** - Перезагружает Nginx
6. ✅ **Status check** - Проверяет что всё работает

---

## 🔧 ПЕРВЫЙ РАЗ (setup):

### 1. Nginx
```bash
cd /home/dxdx-repo
sudo cp nginx-dxcapital.conf /etc/nginx/sites-available/dxcapital-ai.com
sudo ln -sf /etc/nginx/sites-available/dxcapital-ai.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # Удалить старый
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Backend .env
```bash
cd /home/dxdx-repo/backend
nano .env
```

Добавь:
```env
NODE_ENV=production
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/dxcapai?schema=public"
JWT_SECRET=твой_секретный_ключ
TELEGRAM_BOT_TOKEN=твой_токен_бота
# ... остальные переменные
```

### 3. Frontend .env.local (опционально)
```bash
cd /home/dxdx-repo/frontend
nano .env.local
```

```env
NEXT_PUBLIC_API_URL=https://dxcapital-ai.com/api
```

### 4. Первый деплой
```bash
chmod +x /home/dxdx-repo/deploy.sh
cd /home/dxdx-repo && ./deploy.sh
```

---

## 🔄 КАЖДЫЙ ДЕПЛОЙ (обновление):

```bash
cd /home/dxdx-repo && ./deploy.sh
```

Вот и всё! 🎉

---

## 📊 ПОЛЕЗНЫЕ КОМАНДЫ:

```bash
# Статус PM2
pm2 status

# Логи
pm2 logs                    # Все логи
pm2 logs dxcapai-frontend  # Только фронт
pm2 logs dxcapai-backend   # Только бек

# Рестарт
pm2 restart all
pm2 restart dxcapai-frontend
pm2 restart dxcapai-backend

# Мониторинг
pm2 monit

# Остановить всё
pm2 stop all

# Проверка портов
lsof -i :3000  # Frontend
lsof -i :4000  # Backend

# Nginx
sudo nginx -t                              # Проверить конфиг
sudo systemctl reload nginx                # Перезагрузить
sudo tail -f /var/log/nginx/error.log     # Логи
```

---

## 🐛 Если что-то сломалось:

### Frontend не работает:
```bash
cd /home/dxdx-repo/frontend
rm -rf .next node_modules
npm install
npm run build
pm2 restart dxcapai-frontend
```

### Backend не работает:
```bash
cd /home/dxdx-repo/backend
rm -rf dist node_modules
npm install
npx prisma generate
npm run build
pm2 restart dxcapai-backend
```

### Nginx не работает:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
sudo systemctl restart nginx
```

---

## ✅ Что проверить после деплоя:

1. **PM2 статус**: `pm2 status` - всё зелёное?
2. **Порты**: `lsof -i :3000` и `lsof -i :4000` - открыты?
3. **Сайт**: https://dxcapital-ai.com - открывается?
4. **API**: https://dxcapital-ai.com/api/health - возвращает OK?
5. **Логи**: `pm2 logs --lines 20` - нет ошибок?

---

## 🎯 Структура после деплоя:

```
/home/dxdx-repo/
├── frontend/
│   ├── .next/          # Сборка Next.js
│   ├── logs/           # Логи PM2
│   └── node_modules/
├── backend/
│   ├── dist/           # Скомпилированный TypeScript
│   ├── logs/           # Логи PM2
│   ├── uploads/        # Загруженные файлы
│   └── node_modules/
├── deploy.sh           # Скрипт деплоя ✅
├── nginx-dxcapital.conf  # Конфиг Nginx ✅
└── DEPLOYMENT.md       # Полная инструкция
```

---

Вот и всё! Просто запускай `./deploy.sh` когда нужно обновить код! 🚀
