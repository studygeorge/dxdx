-- AlterTable
ALTER TABLE "investments" ADD COLUMN     "bonusUnlockedAt" TIMESTAMP(3),
ADD COLUMN     "bonusWithdrawn" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "investments_bonusUnlockedAt_idx" ON "investments"("bonusUnlockedAt");

-- CreateIndex
CREATE INDEX "investments_bonusWithdrawn_idx" ON "investments"("bonusWithdrawn");
