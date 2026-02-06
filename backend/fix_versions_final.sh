#!/bin/bash

echo "🔧 Final version fix for Fastify ecosystem..."

# Удалить все проблемные пакеты
npm uninstall fastify @fastify/cors @fastify/cookie @fastify/rate-limit @fastify/helmet @fastify/jwt

# Очистить кэш
npm cache clean --force

# Установить совместимые версии - ЛИБО Fastify 4.x, ЛИБО обновить все до 5.x
echo "📦 Option 1: Installing Fastify 4.x ecosystem (STABLE)..."
npm install fastify@^4.28.1
npm install @fastify/cors@^8.5.0
npm install @fastify/cookie@^9.3.1  
npm install @fastify/rate-limit@^9.1.0
npm install @fastify/helmet@^11.1.1
npm install @fastify/jwt@^7.2.4

echo "📋 Installed versions:"
npm list fastify @fastify/cors @fastify/cookie @fastify/rate-limit @fastify/helmet @fastify/jwt

echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Starting backend..."
    pm2 start ecosystem.backend.config.js
    sleep 5
    echo "📊 Status:"
    pm2 status
    echo "📝 Testing backend:"
    curl -X GET http://localhost:4000/api/v1/health || echo "Health endpoint not available"
else
    echo "❌ Build failed!"
    exit 1
fi
