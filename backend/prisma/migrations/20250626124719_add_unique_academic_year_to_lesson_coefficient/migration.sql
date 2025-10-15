/*
  Warnings:

  - A unique constraint covering the columns `[academicYear]` on the table `LessonCoefficient` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LessonCoefficient_academicYear_key" ON "LessonCoefficient"("academicYear");
