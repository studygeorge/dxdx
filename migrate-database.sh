#!/bin/bash

# Database Migration Script
# Applies Prisma migrations to production database

set -e  # Exit on error

REPO_ROOT="/home/dxdx-repo"
BACKEND="$REPO_ROOT/backend"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║            🗄️  DATABASE MIGRATION SCRIPT 🗄️                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Navigate to backend directory
echo "📁 Step 1: Navigating to backend directory..."
cd "$BACKEND" || exit 1
echo "✅ Current directory: $(pwd)"
echo ""

# Step 2: Install dependencies (if needed)
echo "📦 Step 2: Checking dependencies..."
if [ -f "package.json" ]; then
  npm install
  echo "✅ Dependencies installed"
else
  echo "⚠️  No package.json found, skipping npm install"
fi
echo ""

# Step 3: Generate Prisma Client
echo "🔧 Step 3: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

# Step 4: Apply migrations
echo "🚀 Step 4: Applying database migrations..."
echo "⚠️  This will modify the production database!"
echo "⏳ Applying migrations..."
npx prisma migrate deploy
echo "✅ Migrations applied successfully"
echo ""

# Step 5: Check migration status
echo "📊 Step 5: Checking migration status..."
npx prisma migrate status
echo ""

# Step 6: Restart backend service
echo "🔄 Step 6: Restarting backend service..."
pm2 restart dxcapai-backend
echo "✅ Backend service restarted"
echo ""

# Step 7: Check backend logs
echo "📋 Step 7: Backend logs (last 20 lines)..."
pm2 logs dxcapai-backend --lines 20 --nostream
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║               ✅ MIGRATION COMPLETED SUCCESSFULLY ✅          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Backend URL: https://dxcapital-ai.com/api/health"
echo ""
