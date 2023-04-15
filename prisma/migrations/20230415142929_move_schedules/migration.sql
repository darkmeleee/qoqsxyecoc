/*
  Warnings:

  - You are about to drop the column `schedule` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "schedule" TEXT NOT NULL DEFAULT 'Понедельник, среда, пятница - 15:00';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "schedule";
