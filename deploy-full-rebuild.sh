#!/bin/bash

echo "🚀 Full deployment with rebuild started..."

cd /home/dxdx-repo || exit 1

echo "📥 Step 1: Pull latest code"
git pull origin main

echo "🛑 Step 2: Stop PM2 processes"
pm2 stop all

echo "🗑️  Step 3: Clean old builds"
cd frontend
rm -rf .next
rm -rf node_modules/.cache

echo "📦 Step 4: Install dependencies"
npm install

echo "🔨 Step 5: Build frontend"
npm run build

echo "✅ Step 6: Verify build"
if [ ! -f ".next/BUILD_ID" ]; then
  echo "❌ ERROR: Build failed - BUILD_ID not found!"
  exit 1
fi

echo "📝 Build ID: $(cat .next/BUILD_ID)"

cd ..

echo "🔄 Step 7: Restart PM2"
pm2 restart all

echo "📊 Step 8: Check status"
pm2 status

echo "📋 Step 9: Show logs"
pm2 logs --lines 30 --nostream

echo "✅ Deployment completed!"
