#!/bin/bash

echo "🔧 Complete Fastify version fix..."

# Остановить PM2
pm2 stop dxcapai-backend

# Удалить все Fastify пакеты
echo "🗑️ Removing all Fastify packages..."
npm uninstall fastify @fastify/cors @fastify/cookie @fastify/rate-limit @fastify/helmet @fastify/jwt

# Очистить кэш
echo "🧹 Cleaning cache..."
npm cache clean --force

# Установить Fastify 5.x и все совместимые плагины
echo "📦 Installing compatible Fastify 5.x ecosystem..."
npm install fastify@^5.6.1
npm install @fastify/cors@^10.0.0
npm install @fastify/cookie@^10.0.1
npm install @fastify/rate-limit@^10.1.1
npm install @fastify/helmet@^12.0.1
npm install @fastify/jwt@^9.0.1

echo "📋 Installed versions:"
npm list fastify @fastify/cors @fastify/cookie @fastify/rate-limit @fastify/helmet @fastify/jwt

echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Starting backend..."
    pm2 start ecosystem.backend.config.js
    sleep 3
    echo "📊 Status:"
    pm2 status
    echo "📝 Checking logs (last 10 lines):"
    pm2 logs dxcapai-backend --lines 10 --nostream
else
    echo "❌ Build failed!"
    exit 1
fi
