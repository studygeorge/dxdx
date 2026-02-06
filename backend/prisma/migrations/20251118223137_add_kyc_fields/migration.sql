/*
  Warnings:

  - You are about to drop the column `kycDocument` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "kycDocument",
ADD COLUMN     "kycPhotoUrl" TEXT,
ADD COLUMN     "kycProcessedAt" TIMESTAMP(3),
ADD COLUMN     "kycProcessedBy" TEXT,
ADD COLUMN     "kycRejectionReason" TEXT,
ADD COLUMN     "kycSubmittedAt" TIMESTAMP(3),
ALTER COLUMN "kycStatus" SET DEFAULT 'NOT_SUBMITTED';

-- CreateIndex
CREATE INDEX "users_kycStatus_idx" ON "users"("kycStatus");

-- CreateIndex
CREATE INDEX "users_kycSubmittedAt_idx" ON "users"("kycSubmittedAt");
