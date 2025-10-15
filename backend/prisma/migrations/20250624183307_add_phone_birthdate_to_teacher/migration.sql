/*
  Warnings:

  - Added the required column `birthDate` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN "phone" TEXT NOT NULL DEFAULT '00000000000';
ALTER TABLE "Teacher" ADD COLUMN "birthDate" TIMESTAMP(3) NOT NULL DEFAULT '1970-01-01T00:00:00.000Z';
