-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "userId" INTEGER;

-- CreateTable
CREATE TABLE "_queued" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_queued_AB_unique" ON "_queued"("A", "B");

-- CreateIndex
CREATE INDEX "_queued_B_index" ON "_queued"("B");

-- AddForeignKey
ALTER TABLE "_queued" ADD CONSTRAINT "_queued_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_queued" ADD CONSTRAINT "_queued_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
