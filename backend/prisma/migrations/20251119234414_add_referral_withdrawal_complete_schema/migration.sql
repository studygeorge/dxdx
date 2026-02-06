-- AlterTable
ALTER TABLE "referral_withdrawal_requests" ADD COLUMN     "processedBy" TEXT,
ADD COLUMN     "referralEarningId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en';

-- CreateIndex
CREATE INDEX "users_language_idx" ON "users"("language");

-- AddForeignKey
ALTER TABLE "referral_withdrawal_requests" ADD CONSTRAINT "referral_withdrawal_requests_referralUserId_fkey" FOREIGN KEY ("referralUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_withdrawal_requests" ADD CONSTRAINT "referral_withdrawal_requests_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_withdrawal_requests" ADD CONSTRAINT "referral_withdrawal_requests_referralEarningId_fkey" FOREIGN KEY ("referralEarningId") REFERENCES "referral_earnings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
