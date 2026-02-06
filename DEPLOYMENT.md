# 🚀 DEPLOYMENT GUIDE - DXCAPITAL-AI

Инструкция по деплою проекта на сервер.

## 📁 Структура на сервере

```
/home/dxdx-repo/
├── frontend/           # Next.js фронтенд (порт 3000)
├── backend/            # Fastify бекенд (порт 4000)
├── deploy.sh           # Скрипт деплоя
└── .git/              # Git репозиторий
```

---

## 🔧 ПЕРВОНАЧАЛЬНАЯ НАСТРОЙКА

### 1️⃣ Установка Nginx конфигурации

```bash
# На сервере
cd /home/dxdx-repo

# Скопировать конфиг в Nginx
sudo cp nginx-dxcapital.conf /etc/nginx/sites-available/dxcapital-ai.com

# Создать symlink
sudo ln -sf /etc/nginx/sites-available/dxcapital-ai.com /etc/nginx/sites-enabled/

# Удалить старый конфиг (если есть)
sudo rm -f /etc/nginx/sites-enabled/default

# Проверить конфигурацию
sudo nginx -t

# Перезагрузить Nginx
sudo systemctl reload nginx
```

---

### 2️⃣ Создание .env файлов

#### Frontend (.env.local)

```bash
cd /home/dxdx-repo/frontend
nano .env.local
```

Содержимое:
```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://dxcapital-ai.com/api
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

#### Backend (.env)

```bash
cd /home/dxdx-repo/backend
nano .env
```

Содержимое (пример):
```env
# Server
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dxcapai?schema=public"

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://dxcapital-ai.com

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_admin_chat_id

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@dxcapital-ai.com

# Admin
ADMIN_EMAIL=admin@dxcapital-ai.com
ADMIN_PASSWORD=change_this_password

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

---

### 3️⃣ Первичная сборка и запуск

```bash
cd /home/dxdx-repo

# Сделать скрипт деплоя исполняемым
chmod +x deploy.sh

# Запустить первый деплой
./deploy.sh
```

---

## 🔄 РЕГУЛЯРНЫЙ ДЕПЛОЙ

### Простой способ (одна команда):

```bash
cd /home/dxdx-repo && ./deploy.sh
```

### Пошагово:

#### 1. Pull изменений из Git
```bash
cd /home/dxdx-repo
git pull origin main
```

#### 2. Frontend
```bash
cd /home/dxdx-repo/frontend
npm install
npm run build
pm2 restart dxcapai-frontend
```

#### 3. Backend
```bash
cd /home/dxdx-repo/backend
npm install
npx prisma generate
npm run build
pm2 restart dxcapai-backend
pm2 restart dxcapai-telegram-bot
```

#### 4. Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 УПРАВЛЕНИЕ PM2

### Просмотр статуса
```bash
pm2 status
```

### Логи
```bash
# Все логи
pm2 logs

# Frontend логи
pm2 logs dxcapai-frontend

# Backend логи
pm2 logs dxcapai-backend

# Telegram Bot логи
pm2 logs dxcapai-telegram-bot

# Последние 100 строк
pm2 logs --lines 100
```

### Рестарт сервисов
```bash
# Все сервисы
pm2 restart all

# Только Frontend
pm2 restart dxcapai-frontend

# Только Backend
pm2 restart dxcapai-backend

# Только Bot
pm2 restart dxcapai-telegram-bot
```

### Остановка/Запуск
```bash
# Остановить всё
pm2 stop all

# Запустить всё
pm2 start all

# Удалить из PM2
pm2 delete all
```

### Мониторинг
```bash
# Интерактивный мониторинг
pm2 monit

# Информация о процессе
pm2 info dxcapai-frontend
```

---

## 🗄️ БАЗА ДАННЫХ

### Миграции Prisma

```bash
cd /home/dxdx-repo/backend

# Применить миграции
npx prisma migrate deploy

# Создать новую миграцию (development)
npx prisma migrate dev --name migration_name

# Просмотр данных
npx prisma studio
# → http://your-server-ip:5555
```

### Backup базы данных

```bash
# PostgreSQL backup
pg_dump -U postgres dxcapai > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql -U postgres dxcapai < backup_20250206_120000.sql
```

---

## 🔐 SSL СЕРТИФИКАТЫ (Let's Encrypt)

### Первичная установка
```bash
sudo certbot --nginx -d dxcapital-ai.com -d www.dxcapital-ai.com
```

### Обновление сертификата
```bash
sudo certbot renew

# Или принудительно
sudo certbot renew --force-renewal
```

### Проверка автообновления
```bash
sudo systemctl status certbot.timer
```

---

## 🐛 TROUBLESHOOTING

### Frontend не запускается

```bash
# Проверить логи
pm2 logs dxcapai-frontend

# Проверить сборку
cd /home/dxdx-repo/frontend
npm run build

# Проверить порт 3000
lsof -i :3000
netstat -tulpn | grep 3000

# Пересобрать
rm -rf .next node_modules
npm install
npm run build
pm2 restart dxcapai-frontend
```

### Backend не запускается

```bash
# Проверить логи
pm2 logs dxcapai-backend

# Проверить .env
cd /home/dxdx-repo/backend
cat .env

# Проверить БД
npx prisma db pull

# Пересобрать
rm -rf dist node_modules
npm install
npx prisma generate
npm run build
pm2 restart dxcapai-backend
```

### Nginx ошибки

```bash
# Проверить конфигурацию
sudo nginx -t

# Проверить логи
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/dxcapital-error.log

# Перезапуск
sudo systemctl restart nginx
```

### База данных

```bash
# Проверить PostgreSQL
sudo systemctl status postgresql

# Подключиться
psql -U postgres -d dxcapai

# Проверить таблицы
\dt

# Проверить Prisma
cd /home/dxdx-repo/backend
npx prisma studio
```

---

## 📈 МОНИТОРИНГ

### Дисковое пространство
```bash
df -h
du -sh /home/dxdx-repo/*
```

### Память
```bash
free -h
pm2 monit
```

### CPU
```bash
top
htop  # если установлен
```

### Логи
```bash
# PM2 логи
pm2 logs --lines 50

# Nginx логи
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

---

## 🔄 ОТКАТ К ПРЕДЫДУЩЕЙ ВЕРСИИ

```bash
cd /home/dxdx-repo

# Посмотреть историю коммитов
git log --oneline -10

# Откатиться к предыдущему коммиту
git reset --hard HEAD~1

# Или к конкретному коммиту
git reset --hard <commit-hash>

# Передеплоить
./deploy.sh
```

---

## 📞 БЫСТРЫЕ КОМАНДЫ

```bash
# Деплой
cd /home/dxdx-repo && ./deploy.sh

# Статус
pm2 status

# Логи
pm2 logs --lines 50

# Рестарт всего
pm2 restart all && sudo systemctl reload nginx

# Очистка логов
pm2 flush

# Информация о сервере
pm2 info dxcapai-frontend
pm2 info dxcapai-backend
```

---

## 🎯 АЛИАСЫ (опционально)

Добавьте в `~/.bashrc`:

```bash
# DXCAPITAL-AI aliases
alias dxdeploy='cd /home/dxdx-repo && ./deploy.sh'
alias dxlogs='pm2 logs'
alias dxstatus='pm2 status'
alias dxrestart='pm2 restart all && sudo systemctl reload nginx'
alias dxmonit='pm2 monit'
```

Примените:
```bash
source ~/.bashrc
```

---

**Обновлено**: 2025-02-06  
**Версия**: 1.0
