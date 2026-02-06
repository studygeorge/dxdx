#!/bin/bash

echo "🔧 Super final fix..."

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
    
    sleep 5
    
    echo "🎉 Backend is ready!"
    echo ""
    echo "�� PM2 Status:"
    pm2 status
    
    echo ""
    echo "🧪 Testing basic endpoint:"
    curl -s http://localhost:4000/health || echo "Waiting for server to start..."
    
else
    echo "❌ Build failed!"
    exit 1
fi
