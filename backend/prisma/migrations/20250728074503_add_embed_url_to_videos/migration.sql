/*
  Warnings:

  - Added the required column `embedUrl` to the `videos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "embedUrl" TEXT NOT NULL;
