-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TUTOR', 'STUDENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT';
