-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "architecture" TEXT,
ADD COLUMN     "architectureImage" TEXT,
ADD COLUMN     "challenges" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lessonsLearned" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "screenshots" JSONB,
ADD COLUMN     "techStack" JSONB;

-- AlterTable
ALTER TABLE "ResumeFile" ALTER COLUMN "storagePath" DROP DEFAULT,
ALTER COLUMN "storedName" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;
