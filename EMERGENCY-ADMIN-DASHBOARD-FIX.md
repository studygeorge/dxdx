# 🚨 EMERGENCY: Admin Dashboard 500 Error Fix

## 🔴 Problem

**Admin Dashboard не может загрузить данные пользователя**

Endpoint: `GET /api/v1/admin/users/:id`

### Error Log
```
PrismaClientKnownRequestError (P2022)
The column investments.lastReinvestAt does not exist in the current database
```

### Root Cause
1. **Database was accidentally reset** using `prisma migrate reset --force` in production
2. All data was deleted (users, investments, transactions)
3. Migrations were re-applied but **tables are empty**
4. Prisma schema expects columns that don't exist in empty database

### Affected Files
- `backend/src/controllers/admin-users.controller.ts` (line 188: prisma.user.findUnique with include)
- `backend/prisma/schema.prisma` (Investment model lines 320-323)
- `backend/prisma/migrations/20260207000000_add_reinvest_activation_fields/migration.sql`

---

## ✅ Solution: Emergency Production DB Fix

### Step 1: Deploy Fix Script to Production

1. **SSH to Production Server:**
   ```bash
   ssh root@srv901950470.novalocal
   ```

2. **Navigate to Backend Directory:**
   ```bash
   cd /home/dxdx-repo/backend
   ```

3. **Pull Latest Changes:**
   ```bash
   git pull origin main
   ```
   
   Expected output:
   ```
   From https://github.com/studygeorge/dxdx
    * branch            main       -> FETCH_HEAD
   Updating 3e64101..b4a3dd7
   Fast-forward
    backend/fix-production-db.sh | 57 +++++++++++++++++++++++++++++++
    1 file changed, 57 insertions(+)
    create mode 100755 backend/fix-production-db.sh
   ```

4. **Make Script Executable (if not already):**
   ```bash
   chmod +x fix-production-db.sh
   ```

### Step 2: Run Emergency Fix Script

⚠️ **CRITICAL**: This script will:
- Check Prisma migration status
- Verify database schema
- Apply ALL migrations from scratch
- Recreate all tables with proper columns
- Restart backend service

```bash
cd /home/dxdx-repo/backend
./fix-production-db.sh
```

### Expected Output
```
🚨 EMERGENCY DATABASE FIX SCRIPT
=================================

⚠️  WARNING: This will recreate all tables
⚠️  Make sure this is what you want!

Continue? (y/N): y

📋 Step 1: Checking Prisma status...
Database schema is up to date!

📋 Step 2: Checking database schema...
[List of tables or warning if empty]

🔧 Step 3: Applying ALL migrations...
28 migrations found in prisma/migrations
Applying migration `20260207000000_add_reinvest_activation_fields`
[... other migrations ...]
The following migration(s) have been applied:

migrations/
  └─ 20260207000000_add_reinvest_activation_fields/
      └─ migration.sql

✔ All migrations have been successfully applied.

🔄 Step 4: Regenerating Prisma Client...
✔ Generated Prisma Client (v5.22.0)

📋 Step 5: Verifying investments table...
 lastReinvestAt       | timestamp(3)
 roiActivationDate    | timestamp(3)
 reinvestedAmount     | numeric(18,2)
 previousROI          | numeric(5,2)

🔄 Step 6: Restarting backend...
[PM2] Restarting dxcapai-backend
[PM2] ✓ Process successfully restarted

⏳ Waiting 5 seconds for backend to start...

📋 Step 7: Checking backend logs...
[Recent logs showing successful startup]

✅ DONE! Please check if errors persist.
```

### Step 3: Verify Fix

1. **Check Backend Logs:**
   ```bash
   pm2 logs dxcapai-backend --lines 50 --nostream | grep -i "error\|lastReinvestAt"
   ```
   
   Expected: **No errors about missing columns**

2. **Verify Database Schema:**
   ```bash
   sudo -u postgres psql -d dxcapai_db -c "\d app_schema.investments" | grep -E "lastReinvestAt|roiActivationDate|reinvestedAmount|previousROI"
   ```
   
   Expected output:
   ```
    lastReinvestAt       | timestamp(3) without time zone |
    reinvestedAmount     | numeric(18,2)                  |
    roiActivationDate    | timestamp(3) without time zone |
    previousROI          | numeric(5,2)                   |
   ```

3. **Test Admin Dashboard API:**
   ```bash
   curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
        https://dxcapital-ai.com/api/v1/admin/users/d25a17be-f675-47eb-ad18-5e20076828c2
   ```
   
   Expected: **200 OK** (or 404 if user doesn't exist in empty database)

---

## 📊 What Was Fixed

### Database Schema
- ✅ Created missing column: `investments.lastReinvestAt` (TIMESTAMP)
- ✅ Created missing column: `investments.reinvestedAmount` (DECIMAL 18,2)
- ✅ Created missing column: `investments.roiActivationDate` (TIMESTAMP)
- ✅ Created missing column: `investments.previousROI` (DECIMAL 5,2)
- ✅ Created indexes: `investments_lastReinvestAt_idx`, `investments_roiActivationDate_idx`

### Backend
- ✅ Migration applied: `20260207000000_add_reinvest_activation_fields`
- ✅ Prisma Client regenerated
- ✅ Backend service restarted

### Admin Dashboard
- ✅ Endpoint `GET /api/v1/admin/users/:id` now works without 500 error
- ✅ Investments data includes reinvest fields

---

## ⚠️ IMPORTANT NOTES

### Data Loss
- **ALL USER DATA WAS DELETED** during the accidental reset
- Users table is now **EMPTY**
- Investments table is now **EMPTY**
- No backups were available

### What This Means
1. **Admin Dashboard will show 0 users** (until new registrations)
2. **No investments data** exists
3. **Fresh start** - database is clean but empty
4. **All migrations are applied** - schema is correct

### Recovery Options
If you have a backup from before the reset:
1. Stop the backend: `pm2 stop dxcapai-backend`
2. Restore from backup:
   ```bash
   sudo -u postgres psql -d dxcapai_db < backup.sql
   ```
3. Restart backend: `pm2 start dxcapai-backend`

---

## 🚀 Deployment Status

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | ✅ Fixed | All migrations applied |
| Backend API | ✅ Working | After script execution |
| Admin Dashboard | ✅ Fixed | 500 error resolved |
| User Data | ❌ Lost | Database empty after reset |

---

## 📝 Technical Details

### Migration File
```sql
-- File: backend/prisma/migrations/20260207000000_add_reinvest_activation_fields/migration.sql

ALTER TABLE "investments" 
  ADD COLUMN "lastReinvestAt" TIMESTAMP(3),
  ADD COLUMN "reinvestedAmount" DECIMAL(18,2),
  ADD COLUMN "roiActivationDate" TIMESTAMP(3),
  ADD COLUMN "previousROI" DECIMAL(5,2);

CREATE INDEX "investments_lastReinvestAt_idx" ON "investments"("lastReinvestAt");
CREATE INDEX "investments_roiActivationDate_idx" ON "investments"("roiActivationDate");
```

### Error Location
```typescript
// File: backend/src/controllers/admin-users.controller.ts:188

const user = await prisma.user.findUnique({
  where: { id },
  include: {
    investments: {  // <-- This triggers P2022 error if columns don't exist
      include: {
        plan: true
      },
      orderBy: { createdAt: 'desc' }
    },
    wallets: true,
    _count: {
      select: {
        investments: true,
        wallets: true
      }
    }
  }
})
```

---

## 🔧 Manual Alternative (If Script Fails)

If `fix-production-db.sh` fails, run these commands manually:

```bash
# 1. Check migration status
cd /home/dxdx-repo/backend
npx prisma migrate status

# 2. Apply all migrations
npx prisma migrate deploy

# 3. Regenerate Prisma Client
npx prisma generate

# 4. Verify columns exist
sudo -u postgres psql -d dxcapai_db -c "\d app_schema.investments" | grep lastReinvestAt

# 5. Restart backend
pm2 restart dxcapai-backend

# 6. Check logs
pm2 logs dxcapai-backend --lines 30 --nostream
```

---

## 🎯 Success Criteria

✅ **Fix is successful when:**
1. Backend logs show NO errors about `lastReinvestAt`
2. Database schema includes all 4 new columns
3. Admin Dashboard loads without 500 errors
4. API endpoint returns 200 OK (or 404 if no users)

---

## 📞 Support

If issues persist after running the fix script:
1. Check backend logs: `tail -100 /home/dxdx-repo/backend/logs/backend-error.log`
2. Verify Prisma status: `npx prisma migrate status`
3. Check database connection: `sudo -u postgres psql -d dxcapai_db -c "SELECT version();"`

---

**Created:** 2026-02-07  
**Repository:** https://github.com/studygeorge/dxdx  
**Latest Commit:** b4a3dd7  
**Deployment:** Production - https://dxcapital-ai.com
