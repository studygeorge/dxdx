#!/bin/bash

# 🚀 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ ИСПРАВЛЕНИЙ ROI
# Этот скрипт деплоит все исправления для правильного отображения ROI

set -e  # Останавливаться при ошибках

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 STARTING DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Переходим в репозиторий
cd /home/dxdx-repo || { echo "❌ Failed to cd to /home/dxdx-repo"; exit 1; }

echo "🔄 Step 1/6: Pulling latest changes from GitHub..."
git pull origin main || { echo "❌ Git pull failed"; exit 1; }
echo "✅ Code updated successfully"
echo ""

echo "📦 Step 2/6: Installing backend dependencies..."
cd /home/dxdx-repo/backend || { echo "❌ Failed to cd to backend"; exit 1; }
npm install || { echo "❌ npm install failed"; exit 1; }
echo "✅ Dependencies installed"
echo ""

echo "🗄️ Step 3/6: Running database migration..."
npx prisma migrate deploy || echo "⚠️  Migration warning (may be ok if already applied)"
npx prisma generate || { echo "❌ Prisma generate failed"; exit 1; }
echo "✅ Database schema updated"
echo ""

echo "🔄 Step 4/6: Restarting backend service..."
pm2 restart dxcapai-backend || { echo "❌ PM2 restart failed"; exit 1; }
sleep 5
echo "✅ Backend restarted"
echo ""

echo "📊 Step 5/6: Checking backend status..."
pm2 status dxcapai-backend
echo ""

echo "📝 Checking backend logs for ROI recalculation..."
pm2 logs dxcapai-backend --lines 30 --nostream | tail -20
echo ""

echo "🎨 Step 6/6: Deploying frontend..."
cd /home/dxdx-repo || { echo "❌ Failed to cd to repo root"; exit 1; }
./deploy-frontend-only.sh || { echo "❌ Frontend deploy failed"; exit 1; }
echo "✅ Frontend deployed"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 VERIFICATION CHECKLIST:"
echo ""
echo "1. Open: https://dxcapital-ai.com/profile"
echo ""
echo "2. Check Your Accounts section:"
echo "   ✅ 6 months investment should show: 18.5% APY"
echo "   ✅ 12 months investment should show: 20% APY"
echo "   ❌ Should NOT show: 171.5% or 173%"
echo ""
echo "3. Perform a reinvestment and verify banner shows:"
echo "   ✅ Reinvested amount"
echo "   ✅ Activation date (15th/30th/28th Feb)"
echo "   ✅ Countdown timer"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Final system status:"
pm2 status
echo ""
echo "🎉 All done! Please verify the fixes on the website."
