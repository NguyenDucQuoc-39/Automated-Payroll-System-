-- CreateTable
CREATE TABLE "LessonCoefficient" (
    "id" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonCoefficient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DegreeCoefficient" (
    "id" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "master" DOUBLE PRECISION NOT NULL,
    "doctor" DOUBLE PRECISION NOT NULL,
    "associateProfessor" DOUBLE PRECISION NOT NULL,
    "professor" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DegreeCoefficient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassCoefficient" (
    "id" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "minStudents" INTEGER NOT NULL,
    "maxStudents" INTEGER NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassCoefficient_pkey" PRIMARY KEY ("id")
);
