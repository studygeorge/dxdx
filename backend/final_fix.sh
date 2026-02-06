#!/bin/bash

echo "🔧 Final fix for all remaining errors..."

# 1. Принудительно применим схему БД
echo "🗄️  Force updating database schema..."
npx prisma db push --accept-data-loss

# 2. Перегенерируем Prisma client
echo "🔄 Regenerating Prisma client..."
npx prisma generate

# 3. Компилируем проект
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # 4. Запускаем через PM2
    echo "🚀 Starting backend..."
    pm2 delete dxcapai-backend 2>/dev/null || true
    pm2 start ecosystem.backend.config.js
    pm2 save
    
    echo "🎉 Backend is ready!"
    echo ""
    echo "🌐 Test endpoints:"
    echo "   ❤️  Health: curl http://localhost:4000/health"
    echo "   📊 Web3 Info: curl http://localhost:4000/web3/info"
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
    
    echo ""
    echo "🧪 Test Web3 connection:"
    curl -s http://localhost:4000/web3/info | jq '.' || curl -s http://localhost:4000/web3/info
    
else
    echo "❌ Build failed! Check errors above."
    exit 1
fi
