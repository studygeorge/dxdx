#!/bin/bash

# 🚀 Quick Frontend Deploy
# Только фронтенд - без backend, без полного деплоя

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 Quick Frontend Deploy"
echo "═══════════════════════════════════════════════════════════════"
echo ""

cd /home/dxdx-repo

echo "📥 Pulling latest code..."
git pull origin main
echo "✅ Code updated"
echo ""

echo "🎨 Building Frontend..."
cd frontend
npm run build
echo "✅ Frontend built"
echo ""

echo "🔄 Restarting Frontend..."
pm2 restart dxcapai-frontend
echo "✅ Frontend restarted"
echo ""

echo "📊 Frontend Status:"
pm2 info dxcapai-frontend | grep -E "status|uptime|memory|cpu"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ Frontend deployed!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Website: https://dxcapital-ai.com"
echo "📊 Logs: pm2 logs dxcapai-frontend --lines 50"
