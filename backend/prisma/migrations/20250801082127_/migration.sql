/*
  Warnings:

  - The values [UPLOAD_COMPLETED] on the enum `VideoStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `uploadProgress` on the `videos` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VideoStatus_new" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED');
ALTER TABLE "videos" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "videos" ALTER COLUMN "status" TYPE "VideoStatus_new" USING ("status"::text::"VideoStatus_new");
ALTER TYPE "VideoStatus" RENAME TO "VideoStatus_old";
ALTER TYPE "VideoStatus_new" RENAME TO "VideoStatus";
DROP TYPE "VideoStatus_old";
ALTER TABLE "videos" ALTER COLUMN "status" SET DEFAULT 'UPLOADING';
COMMIT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "hasChangedPassword" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "videos" DROP COLUMN "uploadProgress";
