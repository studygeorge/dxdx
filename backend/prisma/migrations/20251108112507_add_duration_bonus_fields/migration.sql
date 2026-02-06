/*
  Warnings:

  - You are about to drop the column `duration` on the `staking_plans` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `staking_plans` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "investments" ADD COLUMN     "bonusAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "durationBonus" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "effectiveROI" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "staking_plans" DROP COLUMN "duration";

-- CreateIndex
CREATE INDEX "investments_duration_idx" ON "investments"("duration");

-- CreateIndex
CREATE UNIQUE INDEX "staking_plans_name_key" ON "staking_plans"("name");
