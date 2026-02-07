#!/bin/bash
set -euo pipefail

echo "🚀 Quick Frontend Deployment Started..."
echo "========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

REPO_ROOT="/home/dxdx-repo"
FRONTEND="$REPO_ROOT/frontend"

echo -e "${BLUE}📦 Step 1/4: Pulling latest code...${NC}"
cd "$REPO_ROOT"
git pull origin main

echo -e "${BLUE}🔧 Step 2/4: Installing dependencies...${NC}"
cd "$FRONTEND"
npm install

echo -e "${BLUE}🏗️  Step 3/4: Building frontend...${NC}"
npm run build

echo -e "${BLUE}♻️  Step 4/4: Restarting PM2 service...${NC}"
pm2 restart dxcapai-frontend

echo ""
echo -e "${GREEN}✅ Frontend deployment completed successfully!${NC}"
echo ""
echo "🔍 Checking service status:"
pm2 status dxcapai-frontend

echo ""
echo -e "${YELLOW}📋 Recent logs:${NC}"
pm2 logs dxcapai-frontend --lines 20 --nostream

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "🌐 Frontend: https://dxcapital-ai.com"
