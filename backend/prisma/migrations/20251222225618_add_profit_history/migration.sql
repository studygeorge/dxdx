-- CreateTable
CREATE TABLE "profit_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profit_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profit_history_userId_recordedAt_idx" ON "profit_history"("userId", "recordedAt");

-- AddForeignKey
ALTER TABLE "profit_history" ADD CONSTRAINT "profit_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
