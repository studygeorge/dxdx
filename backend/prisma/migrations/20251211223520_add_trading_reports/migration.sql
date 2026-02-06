-- CreateTable
CREATE TABLE "trading_reports" (
    "id" TEXT NOT NULL,
    "tradeNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "exchange" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "tradeType" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "entryPrice" DECIMAL(18,8) NOT NULL,
    "exitDate" TIMESTAMP(3),
    "exitPrice" DECIMAL(18,8),
    "pnlPercentage" DECIMAL(10,2) NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "trading_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trading_reports_tradeNumber_key" ON "trading_reports"("tradeNumber");

-- CreateIndex
CREATE INDEX "trading_reports_status_idx" ON "trading_reports"("status");

-- CreateIndex
CREATE INDEX "trading_reports_exchange_idx" ON "trading_reports"("exchange");

-- CreateIndex
CREATE INDEX "trading_reports_asset_idx" ON "trading_reports"("asset");

-- CreateIndex
CREATE INDEX "trading_reports_tradeType_idx" ON "trading_reports"("tradeType");

-- CreateIndex
CREATE INDEX "trading_reports_entryDate_idx" ON "trading_reports"("entryDate");

-- CreateIndex
CREATE INDEX "trading_reports_exitDate_idx" ON "trading_reports"("exitDate");

-- CreateIndex
CREATE INDEX "trading_reports_tradeNumber_idx" ON "trading_reports"("tradeNumber");
