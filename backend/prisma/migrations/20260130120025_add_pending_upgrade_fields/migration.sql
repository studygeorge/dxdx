-- AlterTable
ALTER TABLE "investments" ADD COLUMN     "pendingUpgradePlan" TEXT,
ADD COLUMN     "pendingUpgradeROI" DECIMAL(5,2),
ADD COLUMN     "upgradeActivationDate" TIMESTAMP(3),
ADD COLUMN     "upgradeRequestDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "investments_pendingUpgradeROI_idx" ON "investments"("pendingUpgradeROI");

-- CreateIndex
CREATE INDEX "investments_upgradeActivationDate_idx" ON "investments"("upgradeActivationDate");
