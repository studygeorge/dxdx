-- CreateTable
CREATE TABLE "investment_upgrades" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "oldPackage" TEXT NOT NULL,
    "newPackage" TEXT NOT NULL,
    "oldAPY" DECIMAL(5,2) NOT NULL,
    "newAPY" DECIMAL(5,2) NOT NULL,
    "additionalAmount" DECIMAL(18,2) NOT NULL,
    "oldEndDate" TIMESTAMP(3) NOT NULL,
    "newEndDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedDate" TIMESTAMP(3),

    CONSTRAINT "investment_upgrades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "early_withdrawals" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "investmentAmount" DECIMAL(18,2) NOT NULL,
    "daysInvested" INTEGER NOT NULL,
    "earnedInterest" DECIMAL(18,2) NOT NULL,
    "totalAmount" DECIMAL(18,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedDate" TIMESTAMP(3),

    CONSTRAINT "early_withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "investment_upgrades_investmentId_idx" ON "investment_upgrades"("investmentId");

-- CreateIndex
CREATE INDEX "investment_upgrades_userId_idx" ON "investment_upgrades"("userId");

-- CreateIndex
CREATE INDEX "investment_upgrades_status_idx" ON "investment_upgrades"("status");

-- CreateIndex
CREATE INDEX "early_withdrawals_investmentId_idx" ON "early_withdrawals"("investmentId");

-- CreateIndex
CREATE INDEX "early_withdrawals_userId_idx" ON "early_withdrawals"("userId");

-- CreateIndex
CREATE INDEX "early_withdrawals_status_idx" ON "early_withdrawals"("status");

-- AddForeignKey
ALTER TABLE "investment_upgrades" ADD CONSTRAINT "investment_upgrades_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_upgrades" ADD CONSTRAINT "investment_upgrades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "early_withdrawals" ADD CONSTRAINT "early_withdrawals_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "early_withdrawals" ADD CONSTRAINT "early_withdrawals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
