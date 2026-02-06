-- CreateTable
CREATE TABLE "referral_withdrawal_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referralUserId" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "trc20Address" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "txHash" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "referral_withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "referral_withdrawal_requests_userId_idx" ON "referral_withdrawal_requests"("userId");

-- CreateIndex
CREATE INDEX "referral_withdrawal_requests_referralUserId_idx" ON "referral_withdrawal_requests"("referralUserId");

-- CreateIndex
CREATE INDEX "referral_withdrawal_requests_investmentId_idx" ON "referral_withdrawal_requests"("investmentId");

-- CreateIndex
CREATE INDEX "referral_withdrawal_requests_status_idx" ON "referral_withdrawal_requests"("status");

-- CreateIndex
CREATE INDEX "referral_withdrawal_requests_createdAt_idx" ON "referral_withdrawal_requests"("createdAt");

-- AddForeignKey
ALTER TABLE "referral_withdrawal_requests" ADD CONSTRAINT "referral_withdrawal_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
