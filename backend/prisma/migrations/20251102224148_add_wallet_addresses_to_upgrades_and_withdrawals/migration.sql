-- AlterTable
ALTER TABLE "early_withdrawals" ADD COLUMN     "trc20Address" TEXT;

-- AlterTable
ALTER TABLE "investment_upgrades" ADD COLUMN     "adminWalletAddress" TEXT,
ADD COLUMN     "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "senderWalletAddress" TEXT;
