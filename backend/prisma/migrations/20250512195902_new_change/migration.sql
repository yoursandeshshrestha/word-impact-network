/*
  Warnings:

  - A unique constraint covering the columns `[courseId,courseYear,orderIndex]` on the table `chapters` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "chapters_courseId_orderIndex_key";

-- CreateIndex
CREATE UNIQUE INDEX "chapters_courseId_courseYear_orderIndex_key" ON "chapters"("courseId", "courseYear", "orderIndex");
