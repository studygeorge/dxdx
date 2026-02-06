#!/bin/bash

echo "🚀 Final complete fix..."

# Компилируем проект
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Запускаем через PM2
    echo "🚀 Starting backend..."
    pm2 delete dxcapai-backend 2>/dev/null || true
    pm2 start ecosystem.backend.config.js
    pm2 save
    
    echo "🎉 Backend is ready!"
    echo ""
    echo "🧪 Testing endpoints:"
    sleep 3
    
    echo "❤️  Health check:"
    curl -s http://localhost:4000/health | jq '.' 2>/dev/null || curl -s http://localhost:4000/health
    
    echo ""
    echo "📊 Web3 Info:"
    curl -s http://localhost:4000/web3/info | jq '.' 2>/dev/null || curl -s http://localhost:4000/web3/info
    
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
    
else
    echo "❌ Build failed! Check errors above."
    exit 1
fi
