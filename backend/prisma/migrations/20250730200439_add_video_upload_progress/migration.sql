-- AlterEnum
ALTER TYPE "VideoStatus" ADD VALUE 'UPLOAD_COMPLETED';

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "uploadProgress" INTEGER NOT NULL DEFAULT 0;
