#!/bin/bash

echo "🔧 Final JWT fix..."

# 1. Удаляем проблемные пакеты
echo "📦 Removing problematic packages..."
npm uninstall jsonwebtoken @types/jsonwebtoken

# 2. Очищаем кэш
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# 3. Устанавливаем правильные версии
echo "📦 Installing correct versions..."
npm install jsonwebtoken@9.0.2
npm install -D @types/jsonwebtoken@9.0.5

# 4. Показываем установленные версии
echo "📋 Installed versions:"
npm list jsonwebtoken @types/jsonwebtoken

# 5. Компилируем проект
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # 6. Запускаем через PM2
    echo "🚀 Starting backend..."
    pm2 delete dxcapai-backend 2>/dev/null || true
    pm2 start ecosystem.backend.config.js
    pm2 save
    
    sleep 5
    
    echo "🎉 Backend is ready!"
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
    
    echo ""
    echo "🧪 Testing basic endpoint:"
    sleep 2
    curl -s http://localhost:4000/health | head -5 || echo "Server still starting..."
    
else
    echo "❌ Build failed! Showing errors..."
    npm run build 2>&1 | head -10
    exit 1
fi
