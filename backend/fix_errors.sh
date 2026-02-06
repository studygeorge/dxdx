#!/bin/bash

echo "🔧 Fixing all TypeScript and Prisma errors..."

# 1. Установим недостающие зависимости
echo "📦 Installing missing dependencies..."
npm install @fastify/cookie
npm install -D @types/cookie

# 2. Исправим Prisma схему (удалим дублированные поля)
echo "🗄️  Fixing Prisma schema..."
sed -i '/notifications.*Notification\[\]/d' prisma/schema.prisma

# 3. Применим исправленную схему
echo "🔄 Updating database schema..."
npx prisma db push

# 4. Перегенерируем Prisma client
echo "🔄 Regenerating Prisma client..."
npx prisma generate

# 5. Компилируем проект
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # 6. Запускаем через PM2
    echo "🚀 Starting backend..."
    pm2 start ecosystem.backend.config.js
    
    echo "🎉 Backend is ready!"
    echo ""
    echo "🌐 Available endpoints:"
    echo "   ❤️  Health: http://localhost:4000/health"
    echo "   🔐 Auth: http://localhost:4000/api/v1/auth"
    echo "   🌍 Web3: http://localhost:4000/api/v1/auth/web3"
    echo "   📊 Web3 Info: http://localhost:4000/web3/info"
else
    echo "❌ Build failed! Check errors above."
fi
