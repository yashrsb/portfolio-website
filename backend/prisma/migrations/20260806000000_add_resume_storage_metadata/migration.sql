-- AlterTable
ALTER TABLE "ResumeFile"
    ADD COLUMN "storagePath" TEXT DEFAULT '',
    ADD COLUMN "storedName" TEXT DEFAULT '',
    ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing rows with non-null values derived from storageKey.
UPDATE "ResumeFile"
SET
    "storagePath" = "storageKey",
    "storedName" = "storageKey",
    "updatedAt" = COALESCE("updatedAt", "uploadedAt");

-- Make the new columns required now that data has been backfilled.
ALTER TABLE "ResumeFile"
    ALTER COLUMN "storagePath" SET NOT NULL,
    ALTER COLUMN "storedName" SET NOT NULL,
    ALTER COLUMN "updatedAt" SET NOT NULL;
