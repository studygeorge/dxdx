/*
  Warnings:

  - You are about to alter the column `amount` on the `investments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `roi` on the `investments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to alter the column `expectedReturn` on the `investments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `totalReturn` on the `investments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `apy` on the `staking_plans` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to alter the column `minAmount` on the `staking_plans` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `maxAmount` on the `staking_plans` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `amount` on the `stakings` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `apy` on the `stakings` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to alter the column `earned` on the `stakings` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `fromAmount` on the `trades` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `toAmount` on the `trades` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `exchangeRate` on the `trades` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,8)`.
  - You are about to alter the column `fee` on the `trades` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `blockchainFee` on the `trades` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,8)`.
  - You are about to alter the column `balance` on the `wallets` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.

*/
-- AlterTable
ALTER TABLE "investments" ADD COLUMN     "withdrawalRequested" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "roi" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "expectedReturn" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "totalReturn" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "staking_plans" ALTER COLUMN "apy" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "minAmount" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "maxAmount" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "stakings" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "apy" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "earned" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "trades" ALTER COLUMN "fromAmount" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "toAmount" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "fee" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "blockchainFee" SET DATA TYPE DECIMAL(18,8);

-- AlterTable
ALTER TABLE "wallets" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(18,2);

-- CreateTable
CREATE TABLE "withdrawal_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "trc20Address" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "txHash" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "withdrawal_requests_userId_idx" ON "withdrawal_requests"("userId");

-- CreateIndex
CREATE INDEX "withdrawal_requests_investmentId_idx" ON "withdrawal_requests"("investmentId");

-- CreateIndex
CREATE INDEX "withdrawal_requests_status_idx" ON "withdrawal_requests"("status");

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
