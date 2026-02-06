-- AlterTable
ALTER TABLE "referral_earnings" ADD COLUMN     "withdrawn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "withdrawnAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "referral_earnings_withdrawn_idx" ON "referral_earnings"("withdrawn");
