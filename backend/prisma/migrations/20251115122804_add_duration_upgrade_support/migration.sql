-- AlterTable
ALTER TABLE "investment_upgrades" ADD COLUMN     "newDuration" INTEGER,
ADD COLUMN     "oldDuration" INTEGER,
ADD COLUMN     "upgradeType" TEXT,
ALTER COLUMN "additionalAmount" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "investment_upgrades_upgradeType_idx" ON "investment_upgrades"("upgradeType");
