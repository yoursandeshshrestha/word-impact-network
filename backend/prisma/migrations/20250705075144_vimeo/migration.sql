/*
  Warnings:

  - You are about to drop the column `backblazeUrl` on the `videos` table. All the data in the column will be lost.
  - Added the required column `vimeoId` to the `videos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vimeoUrl` to the `videos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "videos" DROP COLUMN "backblazeUrl",
ADD COLUMN     "vimeoId" TEXT NOT NULL,
ADD COLUMN     "vimeoUrl" TEXT NOT NULL;
