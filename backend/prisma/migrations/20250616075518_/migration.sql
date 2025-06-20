/*
  Warnings:

  - A unique constraint covering the columns `[shortName]` on the table `Degree` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shortName]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fullName]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `type` on the `Degree` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DegreeTypeEnum" AS ENUM ('MASTER', 'DOCTOR', 'ASSOCIATE_PROFESSOR', 'PROFESSOR');

-- AlterTable
ALTER TABLE "Degree" DROP COLUMN "type",
ADD COLUMN     "type" "DegreeTypeEnum" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Degree_shortName_key" ON "Degree"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "Department_shortName_key" ON "Department"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "Department_fullName_key" ON "Department"("fullName");
