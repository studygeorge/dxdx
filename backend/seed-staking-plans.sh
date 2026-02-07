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
  -- Beginner Plan (18.5% APY)
  (
    gen_random_uuid(), 
    'Beginner', 
    18.50, 
    100, 
    1999, 
    'USDT', 
    true, 
    'Entry level investment package with 18.5% monthly ROI', 
    NOW(), 
    NOW()
  ),
  
  -- Standard Plan (19% APY)
  (
    gen_random_uuid(), 
    'Standard', 
    19.00, 
    2000, 
    9999, 
    'USDT', 
    true, 
    'Standard investment package with 19% monthly ROI', 
    NOW(), 
    NOW()
  ),
  
  -- Advanced Plan (19.5% APY)
  (
    gen_random_uuid(), 
    'Advanced', 
    19.50, 
    10000, 
    49999, 
    'USDT', 
    true, 
    'Advanced investment package with 19.5% monthly ROI', 
    NOW(), 
    NOW()
  ),
  
  -- VIP Plan (20% APY)
  (
    gen_random_uuid(), 
    'VIP', 
    20.00, 
    50000, 
    NULL, 
    'USDT', 
    true, 
    'VIP investment package with 20% monthly ROI', 
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
echo "  1. Beginner  - 18.5% APY ($100 - $1,999)"
echo "  2. Standard  - 19.0% APY ($2,000 - $9,999)"
echo "  3. Advanced  - 19.5% APY ($10,000 - $49,999)"
echo "  4. VIP       - 20.0% APY ($50,000+)"
echo ""
echo "🔄 Restarting backend..."
pm2 restart dxcapai-backend

sleep 3
echo ""
echo "📋 Checking backend logs..."
pm2 logs dxcapai-backend --lines 10 --nostream

echo ""
echo "✅ DONE! Refresh frontend to see plans."
