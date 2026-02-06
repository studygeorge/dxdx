# DXCAPAI - Crypto Trading Platform with AI

Полнофункциональная платформа для торговли криптовалютой с AI-управлением инвестициями.

## 📁 Структура проекта

```
dxdx/
├── frontend/           # Next.js 13 (React 18) фронтенд
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── admindashboard/     # Админ панель
│   │   │   ├── client-bonus/       # Бонусная система
│   │   │   ├── directions/         # Направления торговли
│   │   │   ├── faq/               # FAQ страница
│   │   │   ├── hooks/             # React hooks
│   │   │   ├── profile/           # Профиль пользователя
│   │   │   ├── risks-guarantees/  # Риски и гарантии
│   │   │   ├── statistics/        # Статистика
│   │   │   └── team/              # Команда
│   │   ├── components/         # React компоненты
│   │   └── utils/             # Утилиты
│   ├── public/                # Статические файлы
│   └── package.json
│
└── backend/            # Node.js + TypeScript + Fastify бекенд
    ├── src/
    │   ├── bot/                   # Telegram Bot
    │   │   ├── handlers/              # Обработчики команд
    │   │   ├── services/              # Сервисы бота
    │   │   └── localization/          # i18n для бота
    │   ├── config/                # Конфигурация
    │   ├── controllers/           # API контроллеры
    │   │   ├── admin/                 # Админ API
    │   │   └── investments/           # Инвестиции API
    │   ├── middleware/            # Middleware
    │   ├── routes/                # API маршруты
    │   ├── services/              # Бизнес логика
    │   ├── types/                 # TypeScript типы
    │   └── utils/                 # Утилиты
    ├── prisma/                    # Prisma ORM схемы
    └── package.json
```

## 🚀 Технологический стек

### Frontend
- **Framework**: Next.js 13.5.6 (React 18.2.0)
- **Styling**: Tailwind CSS 3.3.5
- **Web3**: 
  - wagmi ^2.17.5
  - viem ^2.37.11
  - ethers ^6.15.0
  - @web3modal/wagmi ^5.1.11
- **State Management**: @tanstack/react-query ^5.90.2
- **i18n**: react-i18next ^16.2.4
- **HTTP Client**: axios ^1.12.2
- **Icons**: lucide-react ^0.553.0

### Backend
- **Runtime**: Node.js + TypeScript 5.2.2
- **Framework**: Fastify 4.28.1
- **ORM**: Prisma ^5.22.0 + PostgreSQL
- **Auth**: 
  - JWT (@fastify/jwt 7.2.4)
  - bcryptjs ^2.4.3
  - SIWE (Sign-In with Ethereum) ^2.3.2
- **Web3**: 
  - ethers ^6.15.0
  - web3 ^4.16.0
  - @walletconnect/sign-client ^2.21.10
- **Bot**: node-telegram-bot-api ^0.64.0
- **Email**: nodemailer ^6.9.15
- **Security**: 
  - @fastify/helmet 11.1.1
  - @fastify/rate-limit 9.1.0
  - @fastify/cors 8.5.0
- **Logging**: winston ^3.11.0
- **Cron Jobs**: node-cron ^4.2.1
- **2FA**: speakeasy ^2.0.0

## 🎯 Основные функции

### Для пользователей
- ✅ **Регистрация/Авторизация**
  - Email + пароль
  - Web3 (MetaMask, WalletConnect)
  - SIWE (Sign-In with Ethereum)
- ✅ **Инвестиции**
  - Создание инвестиций
  - Tracking доходности
  - История транзакций
- ✅ **Стейкинг**
  - Stake криптовалюты
  - Rewards calculation
- ✅ **Реферальная система**
  - Многоуровневая реферальная программа
  - Бонусы за рефералов
- ✅ **KYC верификация**
  - Загрузка документов
  - Верификация личности
- ✅ **Профиль**
  - Управление аккаунтом
  - История операций
  - Статистика
- ✅ **Telegram бот**
  - Уведомления о прибыли
  - Управление инвестициями
  - Поддержка

### Для администраторов
- ✅ **Admin Dashboard**
  - Управление пользователями
  - Просмотр инвестиций
  - Управление транзакциями
  - Настройки платформы
- ✅ **Reporting**
  - Trading отчёты
  - Статистика платформы
  - Экспорт данных (Excel)
- ✅ **Investment Testing**
  - Тестирование инвестиций
  - Симуляция прибыли

## 📦 Установка и запуск

### Требования
- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### Frontend

```bash
cd frontend

# Установка зависимостей
npm install

# Development сервер
npm run dev
# → http://localhost:3000

# Production сборка
npm run build
npm start

# Запуск через PM2
pm2 start ecosystem.config.js
```

### Backend

```bash
cd backend

# Установка зависимостей
npm install

# Настройка окружения
cp .env.example .env
nano .env

# Генерация Prisma Client
npm run db:generate

# Миграция базы данных
npm run db:migrate

# Development режим
npm run dev
# → http://localhost:4000

# Production сборка и запуск
npm run build
npm start

# Запуск Telegram бота
npm run dev:bot  # Development
npm run start:bot # Production

# Запуск через PM2
pm2 start ecosystem.backend.config.js
```

## 🔧 Конфигурация

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Backend `.env`

```env
# Server
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dxcapai?schema=public"

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_admin_chat_id

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@dxcapai.com

# Web3
INFURA_PROJECT_ID=your_infura_project_id
ALCHEMY_API_KEY=your_alchemy_api_key

# Admin
ADMIN_EMAIL=admin@dxcapai.com
ADMIN_PASSWORD=change_this_password

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key
```

## 🗄️ База данных

Проект использует **PostgreSQL + Prisma ORM**.

```bash
# Генерация Prisma Client
npx prisma generate

# Создание миграций
npx prisma migrate dev --name migration_name

# Применение миграций в production
npx prisma migrate deploy

# Просмотр данных в Prisma Studio
npx prisma studio
# → http://localhost:5555

# Seed данных
npm run db:seed
```

### Основные модели
- **User** - Пользователи
- **Investment** - Инвестиции
- **Transaction** - Транзакции
- **Referral** - Рефералы
- **KYC** - KYC документы
- **TradingReport** - Торговые отчёты
- **Settings** - Настройки платформы

## 🤖 Telegram Bot

Бот предоставляет:
- 📊 Уведомления о прибыли
- 💰 Управление инвестициями
- 📈 Статистика портфеля
- 🆘 Поддержка пользователей

Команды:
- `/start` - Начало работы
- `/invest` - Создать инвестицию
- `/portfolio` - Мой портфель
- `/withdraw` - Вывод средств
- `/upgrade` - Апгрейд плана

## 🔐 Безопасность

- ✅ JWT токены для аутентификации
- ✅ Bcrypt для хэширования паролей
- ✅ CORS защита
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ Input validation
- ✅ SQL injection защита (Prisma)
- ✅ XSS защита
- ✅ CSRF защита

## 📝 API Endpoints

### Public
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/web3auth/challenge` - Web3 challenge
- `POST /api/web3auth/verify` - Web3 verify
- `GET /api/public/trading-reports` - Публичные отчёты

### Protected (требуется JWT)
- `GET /api/profile` - Профиль пользователя
- `POST /api/investments` - Создать инвестицию
- `GET /api/investments` - Мои инвестиции
- `GET /api/referrals` - Мои рефералы
- `POST /api/kyc/upload` - Загрузить KYC документы

### Admin (требуется admin роль)
- `GET /api/admin/users` - Все пользователи
- `GET /api/admin/investments` - Все инвестиции
- `POST /api/admin/trading-reports` - Создать отчёт
- `GET /api/admin/settings` - Настройки
- `POST /api/admin/users/:id/ban` - Забанить пользователя

## 🚀 Деплой

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy build/ folder
```

### Backend (VPS/Docker)

**PM2:**
```bash
cd backend
npm run build
pm2 start ecosystem.backend.config.js
pm2 save
pm2 startup
```

**Nginx:**
```nginx
server {
    listen 80;
    server_name api.dxcapai.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📄 Скрипты

### Backend утилиты
- `setup_database.sh` - Настройка БД
- `start-bot.sh` - Запуск Telegram бота
- `send-test-email.js` - Тест email
- `fix_*.sh` - Исправление зависимостей

## 🐛 Troubleshooting

### Frontend
```bash
# Очистка кэша Next.js
rm -rf .next
npm run dev

# Переустановка зависимостей
rm -rf node_modules package-lock.json
npm install
```

### Backend
```bash
# Пересоздание Prisma Client
npx prisma generate

# Сброс БД (ОСТОРОЖНО!)
npx prisma migrate reset

# Проверка SMTP
node send-test-email.js
```

## 📞 Контакты и поддержка

- **Email**: support@dxcapai.com
- **Telegram**: @dxcapai_support
- **Website**: https://dxcapai.com

## 📄 Лицензия

Proprietary - All rights reserved

---

**Разработано командой DXCAPAI** 🚀
