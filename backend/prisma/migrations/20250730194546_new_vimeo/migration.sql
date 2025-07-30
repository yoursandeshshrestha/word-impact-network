-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processingJobId" TEXT,
ADD COLUMN     "status" "VideoStatus" NOT NULL DEFAULT 'UPLOADING',
ALTER COLUMN "embedUrl" DROP NOT NULL;
