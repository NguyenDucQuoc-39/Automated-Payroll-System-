-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "orderNumber" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "orderNumber" SERIAL NOT NULL;

-- CreateTable
CREATE TABLE "Semester" (
    "id" TEXT NOT NULL,
    "orderNumber" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Semester_orderNumber_key" ON "Semester"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_orderNumber_academicYear_key" ON "Semester"("orderNumber", "academicYear");
