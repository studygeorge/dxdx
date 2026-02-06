-- AlterTable
ALTER TABLE "investments" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'TELEGRAM_BOT';

-- CreateIndex
CREATE INDEX "investments_language_idx" ON "investments"("language");
