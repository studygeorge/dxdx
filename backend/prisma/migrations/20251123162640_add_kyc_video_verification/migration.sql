-- AlterTable
ALTER TABLE "users" ADD COLUMN     "kycPhotoMetadata" JSONB,
ADD COLUMN     "kycPhotoTakenAt" TIMESTAMP(3),
ADD COLUMN     "kycVideoMetadata" JSONB,
ADD COLUMN     "kycVideoTakenAt" TIMESTAMP(3),
ADD COLUMN     "kycVideoUrl" TEXT;

-- CreateIndex
CREATE INDEX "users_kycPhotoTakenAt_idx" ON "users"("kycPhotoTakenAt");

-- CreateIndex
CREATE INDEX "users_kycVideoTakenAt_idx" ON "users"("kycVideoTakenAt");
