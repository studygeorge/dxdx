-- AlterTable
ALTER TABLE "users" ADD COLUMN     "referralSource" TEXT;

-- CreateIndex
CREATE INDEX "users_referralSource_idx" ON "users"("referralSource");
