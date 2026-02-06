-- AlterTable
ALTER TABLE "users" ADD COLUMN     "adminComment" TEXT,
ADD COLUMN     "adminTask" TEXT,
ADD COLUMN     "calendarNote" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "taskDate" TEXT;

-- CreateIndex
CREATE INDEX "users_phoneNumber_idx" ON "users"("phoneNumber");

-- CreateIndex
CREATE INDEX "users_taskDate_idx" ON "users"("taskDate");
