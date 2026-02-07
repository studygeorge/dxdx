#!/bin/bash

# 🔴 EMERGENCY: Fix Production Database After Reset
# This script properly recreates all tables after accidental reset

set -e

echo "🚨 EMERGENCY DATABASE FIX SCRIPT"
echo "================================="
echo ""
echo "⚠️  WARNING: This will recreate all tables"
echo "⚠️  Make sure this is what you want!"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

echo ""
echo "📋 Step 1: Checking Prisma status..."
npx prisma migrate status

echo ""
echo "📋 Step 2: Checking database schema..."
sudo -u postgres psql -d dxcapai_db -c "\dt app_schema.*" || echo "⚠️  No tables found"

echo ""
echo "🔧 Step 3: Applying ALL migrations..."
npx prisma migrate deploy

echo ""
echo "🔄 Step 4: Regenerating Prisma Client..."
npx prisma generate

echo ""
echo "📋 Step 5: Verifying investments table..."
sudo -u postgres psql -d dxcapai_db -c "\d app_schema.investments" | grep -i "lastReinvestAt\|roiActivationDate" || echo "⚠️  Columns not found!"

echo ""
echo "🔄 Step 6: Restarting backend..."
pm2 restart dxcapai-backend

echo ""
echo "⏳ Waiting 5 seconds for backend to start..."
sleep 5

echo ""
echo "📋 Step 7: Checking backend logs..."
pm2 logs dxcapai-backend --lines 20 --nostream

echo ""
echo "✅ DONE! Please check if errors persist."
echo ""
echo "🧪 Test command:"
echo "   curl -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' https://dxcapital-ai.com/api/v1/admin/users/d25a17be-f675-47eb-ad18-5e20076828c2"
