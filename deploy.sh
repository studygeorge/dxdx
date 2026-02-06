#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# 🚀 DXCAPITAL-AI Deployment Script
# Обновлено: 2025-02-06
# ═══════════════════════════════════════════════════════════════

set -e  # Остановить при ошибке

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Пути
REPO_DIR="/home/dxdx-repo"
FRONTEND_DIR="$REPO_DIR/frontend"
BACKEND_DIR="$REPO_DIR/backend"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 DXCAPITAL-AI Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# 📥 1. GIT PULL
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}📥 Step 1: Pulling latest code from Git...${NC}"
cd "$REPO_DIR"

# Проверка Git статуса
if [ -d ".git" ]; then
    echo "✅ Git repository found"
    
    # Stash local changes (если есть)
    if ! git diff-index --quiet HEAD --; then
        echo "⚠️  Local changes detected, stashing..."
        git stash
    fi
    
    # Pull latest
    git pull origin main
    echo -e "${GREEN}✅ Git pull completed${NC}"
else
    echo -e "${RED}❌ Not a git repository. Skipping git pull.${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 🎨 2. FRONTEND BUILD
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}🎨 Step 2: Building Frontend...${NC}"
cd "$FRONTEND_DIR"

# Создать папку для логов
mkdir -p logs

# Установка зависимостей
echo "📦 Installing frontend dependencies..."
npm install --production=false

# Сборка Next.js
echo "🔨 Building Next.js..."
npm run build

echo -e "${GREEN}✅ Frontend build completed${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# ⚙️ 3. BACKEND BUILD
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}⚙️ Step 3: Building Backend...${NC}"
cd "$BACKEND_DIR"

# Создать папки
mkdir -p logs
mkdir -p uploads

# Установка зависимостей
echo "📦 Installing backend dependencies..."
npm install --production=false

# Генерация Prisma Client
echo "🗄️  Generating Prisma Client..."
npx prisma generate

# Сборка TypeScript
echo "🔨 Building TypeScript..."
npm run build

echo -e "${GREEN}✅ Backend build completed${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# 🔄 4. PM2 RESTART
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}🔄 Step 4: Restarting services with PM2...${NC}"

# Остановить все процессы (если запущены)
pm2 stop all || true

# Удалить старые процессы
pm2 delete all || true

# Запустить Backend
echo "🚀 Starting Backend..."
cd "$BACKEND_DIR"
pm2 start ecosystem.backend.config.js

# Запустить Frontend
echo "🚀 Starting Frontend..."
cd "$FRONTEND_DIR"
pm2 start ecosystem.config.js

# Сохранить PM2 конфигурацию
pm2 save

echo -e "${GREEN}✅ PM2 services restarted${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# 🌐 5. NGINX RELOAD
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}🌐 Step 5: Reloading Nginx...${NC}"

# Проверка конфигурации Nginx
if nginx -t; then
    echo "✅ Nginx configuration is valid"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
else
    echo -e "${RED}❌ Nginx configuration error!${NC}"
    echo "Please fix Nginx configuration manually."
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# ✅ 6. STATUS CHECK
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}📊 Step 6: Checking services status...${NC}"
echo ""

# PM2 статус
pm2 status

echo ""

# Проверка портов
echo "🔌 Checking ports:"
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend (port 3000) is running${NC}"
else
    echo -e "${RED}❌ Frontend (port 3000) is NOT running${NC}"
fi

if lsof -i :4000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend (port 4000) is running${NC}"
else
    echo -e "${RED}❌ Backend (port 4000) is NOT running${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 🎉 COMPLETED
# ═══════════════════════════════════════════════════════════════
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "🌐 Website: https://dxcapital-ai.com"
echo "📊 PM2 logs: pm2 logs"
echo "📊 PM2 status: pm2 status"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  pm2 logs               - View all logs"
echo "  pm2 logs frontend      - Frontend logs"
echo "  pm2 logs backend       - Backend logs"
echo "  pm2 restart all        - Restart all services"
echo "  pm2 monit              - Monitor services"
echo ""
