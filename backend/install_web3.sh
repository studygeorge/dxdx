#!/bin/bash

echo "🚀 Installing Web3 features for DXCAPAI Backend..."

# 1. Устанавливаем Web3 зависимости
echo "📦 Installing Web3 dependencies..."
npm install ethers@^5.7.2 web3@^4.3.0 siwe@^2.1.4 @walletconnect/sign-client@^2.10.0
npm install -D @types/web3@^1.2.2

# 2. Обновляем схему базы данных
echo "🗄️  Updating database schema..."
npx prisma db push

# 3. Генерируем новый Prisma client
echo "🔄 Regenerating Prisma client..."
npx prisma generate

# 4. Компилируем проект
echo "🔨 Building project..."
npm run build

# 5. Перезапускаем PM2
echo "🔄 Restarting backend..."
pm2 reload dxcapai-backend

echo "✅ Web3 integration completed!"
echo ""
echo "🌐 New Web3 endpoints:"
echo "   🔗 Connect wallet: POST /api/v1/auth/web3/connect"
echo "   ✅ Verify signature: POST /api/v1/auth/web3/verify"
echo "   📊 Wallet info: GET /api/v1/auth/web3/wallet/:address"
echo "   🌍 Networks: GET /api/v1/auth/web3/networks"
echo ""
echo "🧪 Test Web3 connection:"
echo "   curl http://localhost:4000/web3/info"