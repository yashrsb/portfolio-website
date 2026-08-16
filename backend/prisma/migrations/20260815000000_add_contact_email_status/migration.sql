-- CreateEnum for email notification status tracking
CREATE TYPE "ContactEmailStatus" AS ENUM ('pending', 'sent', 'failed');

-- AlterTable: add metadata and email-notification columns to ContactMessage
ALTER TABLE "ContactMessage"
    ADD COLUMN "ipAddress" TEXT,
    ADD COLUMN "userAgent" TEXT,
    ADD COLUMN "emailStatus" "ContactEmailStatus" NOT NULL DEFAULT 'pending',
    ADD COLUMN "emailSentAt" TIMESTAMP(3),
    ADD COLUMN "emailError" TEXT;

-- CreateIndex: speed up filtering by email notification status
CREATE INDEX "ContactMessage_emailStatus_idx" ON "ContactMessage"("emailStatus");
