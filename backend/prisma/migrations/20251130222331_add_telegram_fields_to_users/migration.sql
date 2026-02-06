/*
  Warnings:

  - A unique constraint covering the columns `[telegramId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "telegramAuthDate" TIMESTAMP(3),
ADD COLUMN     "telegramFirstName" TEXT,
ADD COLUMN     "telegramId" TEXT,
ADD COLUMN     "telegramLastName" TEXT,
ADD COLUMN     "telegramPhotoUrl" TEXT,
ADD COLUMN     "telegramUsername" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_telegramId_key" ON "users"("telegramId");

-- CreateIndex
CREATE INDEX "users_telegramId_idx" ON "users"("telegramId");

-- CreateIndex
CREATE INDEX "users_telegramUsername_idx" ON "users"("telegramUsername");
