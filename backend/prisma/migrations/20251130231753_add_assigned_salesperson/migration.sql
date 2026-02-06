-- AlterTable
ALTER TABLE "users" ADD COLUMN     "assignedSalesperson" TEXT;

-- CreateIndex
CREATE INDEX "users_assignedSalesperson_idx" ON "users"("assignedSalesperson");
