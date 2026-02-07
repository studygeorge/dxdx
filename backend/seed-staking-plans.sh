#!/bin/bash

# 🎯 SEED STAKING PLANS
# Creates investment packages in database

set -e

echo "🎯 SEEDING STAKING PLANS"
echo "========================="
echo ""

# Connect to PostgreSQL and insert staking plans
sudo -u postgres psql -d dxcapai_db <<'EOSQL'

-- Delete existing plans (if any)
DELETE FROM app_schema.staking_plans;

-- Insert Staking Plans
INSERT INTO app_schema.staking_plans (
  id, 
  name, 
  apy, 
  "minAmount", 
  "maxAmount", 
  currency, 
  "isActive", 
  description, 
  "createdAt", 
  "updatedAt"
)
VALUES
  -- Starter Plan (14% APY)
  (
    gen_random_uuid(), 
    'Starter', 
    14.00, 
    100, 
    999, 
    'USDT', 
    true, 
    'Starter investment package with up to 14% monthly ROI', 
    NOW(), 
    NOW()
  ),
  
  -- Advanced Plan (17% APY)
  (
    gen_random_uuid(), 
    'Advanced', 
    17.00, 
    1000, 
    2999, 
    'USDT', 
    true, 
    'Advanced investment package with up to 17% monthly ROI', 
    NOW(), 
    NOW()
  ),
  
  -- Pro Plan (20% APY)
  (
    gen_random_uuid(), 
    'Pro', 
    20.00, 
    3000, 
    5999, 
    'USDT', 
    true, 
    'Pro investment package with up to 20% monthly ROI', 
    NOW(), 
    NOW()
  ),
  
  -- Elite Plan (22% APY)
  (
    gen_random_uuid(), 
    'Elite', 
    22.00, 
    6000, 
    NULL, 
    'USDT', 
    true, 
    'Elite investment package with up to 22% monthly ROI', 
    NOW(), 
    NOW()
  );

-- Verify inserted plans
SELECT 
  name, 
  apy, 
  "minAmount", 
  "maxAmount", 
  "isActive"
FROM app_schema.staking_plans
ORDER BY "minAmount" ASC;

EOSQL

echo ""
echo "✅ Staking plans seeded successfully!"
echo ""
echo "📋 Plans created:"
echo "  1. Starter   - 14% APY ($100 - $999)"
echo "  2. Advanced  - 17% APY ($1,000 - $2,999)"
echo "  3. Pro       - 20% APY ($3,000 - $5,999)"
echo "  4. Elite     - 22% APY ($6,000+)"
echo ""
echo "🔄 Restarting backend..."
pm2 restart dxcapai-backend

sleep 3
echo ""
echo "📋 Checking backend logs..."
pm2 logs dxcapai-backend --lines 10 --nostream

echo ""
echo "✅ DONE! Refresh frontend to see plans."
