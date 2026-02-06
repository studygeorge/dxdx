-- AlterTable
ALTER TABLE "investments" ADD COLUMN     "simulatedCurrentDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "investments_simulatedCurrentDate_idx" ON "investments"("simulatedCurrentDate");
