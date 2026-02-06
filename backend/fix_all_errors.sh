#!/bin/bash

echo "🔧 Fixing all errors completely..."

# 1. Применим исправленную схему
echo "🗄️  Updating database schema..."
npx prisma db push

# 2. Перегенерируем Prisma client
echo "🔄 Regenerating Prisma client..."
npx prisma generate

# 3. Установим недостающие зависимости
echo "📦 Installing dependencies..."
npm install @fastify/cookie

# 4. Компилируем проект
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # 5. Запускаем через PM2
    echo "🚀 Starting backend..."
    pm2 delete dxcapai-backend 2>/dev/null || true
    pm2 start ecosystem.backend.config.js
    pm2 save
    
    echo "�� Backend is ready!"
    echo ""
    echo "🌐 Available endpoints:"
    echo "   ❤️  Health: http://localhost:4000/health"
    echo "   🔐 Auth: http://localhost:4000/api/v1/auth"
    echo "   🌍 Web3: http://localhost:4000/api/v1/auth/web3"
    echo "   📊 Web3 Info: http://localhost:4000/web3/info"
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
else
    echo "❌ Build failed! Check errors above."
    exit 1
fi
