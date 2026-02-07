# 🔥 DATABASE RECREATION FROM SCRATCH

## 🎯 Objective

**Recreate database completely from current schema.prisma**

Since the database is already empty after accidental reset, we'll create a fresh database with a single migration containing the complete schema.

---

## 🔴 Why This Approach?

### Problems with Old Migrations:
- ❌ 28 separate migrations files
- ❌ Complex migration history
- ❌ Some migrations reference non-existent tables
- ❌ Migration `ALTER TABLE investments` fails on empty database
- ❌ Difficult to maintain and debug

### Solution:
- ✅ **Delete all old migrations**
- ✅ **Create ONE migration from schema.prisma**
- ✅ **Fresh start with clean schema**
- ✅ **All columns in correct state**
- ✅ **Easy to maintain**

---

## 📋 What This Does

1. **Drops ALL tables** in `app_schema`
2. **Drops `_prisma_migrations`** table
3. **Creates fresh migration** from `schema.prisma`
4. **Applies migration** to database
5. **Regenerates Prisma Client**
6. **Restarts backend** service

---

## 🚀 Deployment Steps

### Step 1: Deploy to Production

```bash
# SSH to production
ssh root@srv901950470.novalocal

# Navigate to backend
cd /home/dxdx-repo/backend

# Pull latest changes
git pull origin main
```

### Step 2: Run Database Recreation Script

```bash
cd /home/dxdx-repo/backend
./recreate-database.sh
```

### Expected Output:

```
🔥 DATABASE RECREATION SCRIPT
=============================

⚠️  WARNING: This will:
    1. Drop ALL existing tables
    2. Drop _prisma_migrations table
    3. Create fresh schema from schema.prisma
    4. Restart backend service

⚠️  Database is already empty, so this is safe!

Continue? (y/N): y

📋 Step 1: Checking current database...
[List of current tables or empty]

🗑️  Step 2: Dropping all tables in app_schema...
DROP TABLE
[... for each table ...]
✅ All tables dropped!

📋 Step 3: Creating initial migration from schema.prisma...
Prisma Migrate created and applied the following migration(s) from new schema changes:

migrations/
  └─ 20260207_init/
      └─ migration.sql

✔ Generated Prisma Client (v5.22.0)

📋 Step 4: Applying migration to database...
The following migration(s) have been applied:

migrations/
  └─ 20260207_init/
      └─ migration.sql

✔ All migrations have been successfully applied.

🔄 Step 5: Generating Prisma Client...
✔ Generated Prisma Client (v5.22.0)

📋 Step 6: Verifying database schema...
Checking investments table...
 lastReinvestAt       | timestamp(3)
 roiActivationDate    | timestamp(3)
 reinvestedAmount     | numeric(18,2)
 previousROI          | numeric(5,2)

Counting tables...
✅ Total tables in app_schema: 23

🔄 Step 7: Restarting backend...
[PM2] Restarting dxcapai-backend
[PM2] ✓ Process successfully restarted

📋 Step 8: Checking backend logs...
[Recent logs - no errors]

✅ DATABASE RECREATION COMPLETE!
```

---

## ✅ What Will Be Created

### Database Schema (23 Tables):

1. **users** - User accounts with KYC, Telegram, Web3
2. **profit_history** - Profit tracking
3. **sessions** - User sessions
4. **web3_sessions** - Web3 authentication
5. **wallets** - User cryptocurrency wallets
6. **trades** - Trading history
7. **stakings** - Staking records
8. **staking_plans** - Investment packages
9. **investments** - User investments (with ALL fields including lastReinvestAt, roiActivationDate, etc.)
10. **investment_upgrades** - Package upgrades
11. **investment_reinvests** - Reinvestment records
12. **early_withdrawals** - Early withdrawal requests
13. **partial_withdrawals** - Partial withdrawal requests
14. **withdrawal_requests** - Full withdrawal requests
15. **referral_earnings** - Referral commissions
16. **referral_withdrawal_requests** - Referral withdrawal requests
17. **trading_reports** - Admin trading reports
18. **audit_logs** - System audit logs
19. **system_config** - System configuration
20. **admins** - Admin accounts
21. **admin_sessions** - Admin sessions
22. **admin_audit_logs** - Admin action logs
23. **_prisma_migrations** - Migration tracking

### All Investment Fields:
- ✅ `lastReinvestAt` (TIMESTAMP)
- ✅ `reinvestedAmount` (DECIMAL 18,2)
- ✅ `roiActivationDate` (TIMESTAMP)
- ✅ `previousROI` (DECIMAL 5,2)
- ✅ `pendingUpgradeROI` (DECIMAL 5,2)
- ✅ `pendingUpgradePlan` (TEXT)
- ✅ `upgradeActivationDate` (TIMESTAMP)
- ✅ `upgradeRequestDate` (TIMESTAMP)
- ✅ All other standard fields

---

## 🔧 Verification Steps

### 1. Check Tables Created:
```bash
sudo -u postgres psql -d dxcapai_db -c "\dt app_schema.*"
```

Expected: **23 tables** listed

### 2. Verify Investments Table:
```bash
sudo -u postgres psql -d dxcapai_db -c "\d app_schema.investments"
```

Expected: All columns present including `lastReinvestAt`, `roiActivationDate`, etc.

### 3. Check Table Counts:
```bash
sudo -u postgres psql -d dxcapai_db -c "SELECT COUNT(*) FROM app_schema.users;"
sudo -u postgres psql -d dxcapai_db -c "SELECT COUNT(*) FROM app_schema.investments;"
```

Expected: **0** (empty tables)

### 4. Check Backend Logs:
```bash
pm2 logs dxcapai-backend --lines 50 --nostream | grep -i "error\|prisma"
```

Expected: **No errors** about missing columns

### 5. Test Admin API:
```bash
curl https://dxcapital-ai.com/api/v1/admin/users
```

Expected: **200 OK** with empty user list

---

## 📝 After Recreation

### Database State:
- ✅ **All tables created** with correct schema
- ✅ **No migration errors**
- ✅ **Prisma Client up to date**
- ❌ **Database is EMPTY** - no data

### What You Need to Do:

#### 1. Create Admin User
You'll need to manually create an admin in the database or via Telegram bot.

#### 2. Seed Staking Plans
Create investment packages (Beginner, Standard, VIP, etc.)

```sql
INSERT INTO app_schema.staking_plans (id, name, apy, "minAmount", "maxAmount", currency, "isActive", description, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Beginner', 18.50, 100, 1999, 'USDT', true, 'Entry level package', NOW(), NOW()),
  (gen_random_uuid(), 'Standard', 19.00, 2000, 9999, 'USDT', true, 'Standard package', NOW(), NOW()),
  (gen_random_uuid(), 'VIP', 20.00, 10000, NULL, 'USDT', true, 'VIP package', NOW(), NOW());
```

#### 3. Test Registration
- Register new test user via frontend
- Verify user appears in admin dashboard
- Create test investment

---

## 🔄 Migration Files Structure

### Before (28 files):
```
prisma/migrations/
├── 20251026170935_add_staking_system/
├── 20251026213215_add_investments_table/
├── 20251029223320_add_withdrawal_system/
├── [... 25 more migrations ...]
└── migration_lock.toml
```

### After (1 file):
```
prisma/migrations/
├── 20260207_init/
│   └── migration.sql  (Complete schema in one file)
└── migration_lock.toml
```

---

## ⚠️ Important Notes

### Data Loss:
- ❌ **All data already lost** from previous reset
- ✅ **This script is safe** - database is already empty
- ✅ **Fresh start** with correct schema

### No Rollback:
- ⚠️ **Cannot undo** after running
- ⚠️ **All tables will be dropped**
- ✅ **But database is already empty**, so nothing to lose

### Production Safety:
- ✅ **Script has confirmation prompt**
- ✅ **Shows current state** before dropping
- ✅ **Verifies schema** after creation
- ✅ **Checks backend logs** for errors

---

## 🚨 Troubleshooting

### If Script Fails:

#### Error: "permission denied"
```bash
chmod +x recreate-database.sh
sudo ./recreate-database.sh
```

#### Error: "prisma migrate dev requires --create-only"
Run commands manually:
```bash
cd /home/dxdx-repo/backend

# Delete old migrations
rm -rf prisma/migrations
mkdir -p prisma/migrations

# Create migration from schema
npx prisma migrate dev --name init --create-only

# Apply migration
npx prisma migrate deploy

# Generate client
npx prisma generate

# Restart backend
pm2 restart dxcapai-backend
```

#### Error: "database connection failed"
Check PostgreSQL is running:
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

---

## 🎯 Success Criteria

✅ **Recreation successful when:**
1. ✅ All 23 tables created in `app_schema`
2. ✅ `investments` table has `lastReinvestAt` column
3. ✅ Backend starts without Prisma errors
4. ✅ Admin API returns 200 OK
5. ✅ Only ONE migration file exists
6. ✅ Database is empty but schema is correct

---

## 📞 Support

If issues persist:
1. Check backend logs: `tail -100 /home/dxdx-repo/backend/logs/backend-error.log`
2. Verify Prisma: `npx prisma migrate status`
3. Check database: `sudo -u postgres psql -d dxcapai_db -c "\dt app_schema.*"`

---

**Created:** 2026-02-07  
**Repository:** https://github.com/studygeorge/dxdx  
**Branch:** genspark_ai_developer/recreate-database-from-scratch  
**Deployment:** Production - https://dxcapital-ai.com
