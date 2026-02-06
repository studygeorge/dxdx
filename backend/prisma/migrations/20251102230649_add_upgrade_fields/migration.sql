-- AlterTable
ALTER TABLE "investment_upgrades" ADD COLUMN     "accumulatedInterest" DECIMAL(18,2) DEFAULT 0;

-- AlterTable
ALTER TABLE "investments" ADD COLUMN     "accumulatedInterest" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "lastUpgradeDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "investments_lastUpgradeDate_idx" ON "investments"("lastUpgradeDate");
