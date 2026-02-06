-- AlterTable
ALTER TABLE "early_withdrawals" ADD COLUMN     "withdrawnProfits" DECIMAL(18,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "investments" ADD COLUMN     "withdrawnProfits" DECIMAL(18,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "partial_withdrawals" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "trc20Address" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "txHash" TEXT,
    "rejectionReason" TEXT,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partial_withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "partial_withdrawals_investmentId_idx" ON "partial_withdrawals"("investmentId");

-- CreateIndex
CREATE INDEX "partial_withdrawals_userId_idx" ON "partial_withdrawals"("userId");

-- CreateIndex
CREATE INDEX "partial_withdrawals_status_idx" ON "partial_withdrawals"("status");

-- CreateIndex
CREATE INDEX "partial_withdrawals_requestDate_idx" ON "partial_withdrawals"("requestDate");

-- AddForeignKey
ALTER TABLE "partial_withdrawals" ADD CONSTRAINT "partial_withdrawals_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partial_withdrawals" ADD CONSTRAINT "partial_withdrawals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
