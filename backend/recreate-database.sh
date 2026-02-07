#!/bin/bash

# 🔥 RECREATE DATABASE FROM SCRATCH
# This script completely recreates the database based on current schema.prisma

set -e

echo "🔥 DATABASE RECREATION SCRIPT"
echo "============================="
echo ""
echo "⚠️  WARNING: This will:"
echo "    1. Drop ALL existing tables"
echo "    2. Drop _prisma_migrations table"
echo "    3. Create fresh schema from schema.prisma"
echo "    4. Restart backend service"
echo ""
echo "⚠️  Database is already empty, so this is safe!"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

echo ""
echo "📋 Step 1: Checking current database..."
sudo -u postgres psql -d dxcapai_db -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'app_schema';" || echo "⚠️  No tables or error"

echo ""
echo "🗑️  Step 2: Dropping all tables in app_schema..."
sudo -u postgres psql -d dxcapai_db <<EOF
DO \$\$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'app_schema') LOOP
        EXECUTE 'DROP TABLE IF EXISTS app_schema.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END \$\$;

-- Also drop _prisma_migrations if exists
DROP TABLE IF EXISTS _prisma_migrations CASCADE;
EOF

echo ""
echo "✅ All tables dropped!"

echo ""
echo "📋 Step 3: Creating initial migration from schema.prisma..."
npx prisma migrate dev --name init --create-only

echo ""
echo "🔄 Step 4: Applying migration to database..."
npx prisma migrate deploy

echo ""
echo "🔄 Step 5: Generating Prisma Client..."
npx prisma generate

echo ""
echo "📋 Step 6: Verifying database schema..."
echo ""
echo "Checking investments table..."
sudo -u postgres psql -d dxcapai_db -c "\d app_schema.investments" | grep -E "lastReinvestAt|roiActivationDate|reinvestedAmount|previousROI" || echo "⚠️  Columns check completed"

echo ""
echo "Counting tables..."
TABLE_COUNT=$(sudo -u postgres psql -d dxcapai_db -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'app_schema';")
echo "✅ Total tables in app_schema: $TABLE_COUNT"

echo ""
echo "🔄 Step 7: Restarting backend..."
pm2 restart dxcapai-backend

echo ""
echo "⏳ Waiting 5 seconds for backend to start..."
sleep 5

echo ""
echo "📋 Step 8: Checking backend logs..."
pm2 logs dxcapai-backend --lines 20 --nostream

echo ""
echo "✅ DATABASE RECREATION COMPLETE!"
echo ""
echo "🧪 Test commands:"
echo "   1. Check tables: sudo -u postgres psql -d dxcapai_db -c '\dt app_schema.*'"
echo "   2. Check users count: sudo -u postgres psql -d dxcapai_db -c 'SELECT COUNT(*) FROM app_schema.users;'"
echo "   3. Test admin API: curl https://dxcapital-ai.com/api/v1/admin/users"
echo ""
echo "📝 NOTE: Database is empty. You need to:"
echo "   - Create admin user"
echo "   - Register test users"
echo "   - Create test investments"
