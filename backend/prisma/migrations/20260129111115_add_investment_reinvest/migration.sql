-- CreateTable
CREATE TABLE "investment_reinvests" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reinvestedAmount" DECIMAL(18,2) NOT NULL,
    "fromProfit" DECIMAL(18,2) NOT NULL,
    "oldPackage" TEXT NOT NULL,
    "newPackage" TEXT NOT NULL,
    "oldROI" DECIMAL(5,2) NOT NULL,
    "newROI" DECIMAL(5,2) NOT NULL,
    "oldAmount" DECIMAL(18,2) NOT NULL,
    "newAmount" DECIMAL(18,2) NOT NULL,
    "upgraded" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedDate" TIMESTAMP(3),

    CONSTRAINT "investment_reinvests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "investment_reinvests_investmentId_idx" ON "investment_reinvests"("investmentId");

-- CreateIndex
CREATE INDEX "investment_reinvests_userId_idx" ON "investment_reinvests"("userId");

-- CreateIndex
CREATE INDEX "investment_reinvests_status_idx" ON "investment_reinvests"("status");

-- CreateIndex
CREATE INDEX "investment_reinvests_requestDate_idx" ON "investment_reinvests"("requestDate");

-- AddForeignKey
ALTER TABLE "investment_reinvests" ADD CONSTRAINT "investment_reinvests_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_reinvests" ADD CONSTRAINT "investment_reinvests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
