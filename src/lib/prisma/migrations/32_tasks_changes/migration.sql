-- AlterTable
ALTER TABLE "UserTasks" ADD COLUMN     "Type" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "_ProductUserChangesToUserTasks" (
    "A" UUID NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProductUserChangesToUserTasks_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProductUserChangesToUserTasks_B_index" ON "_ProductUserChangesToUserTasks"("B");

-- AddForeignKey
ALTER TABLE "_ProductUserChangesToUserTasks" ADD CONSTRAINT "_ProductUserChangesToUserTasks_A_fkey" FOREIGN KEY ("A") REFERENCES "ProductUserChanges"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductUserChangesToUserTasks" ADD CONSTRAINT "_ProductUserChangesToUserTasks_B_fkey" FOREIGN KEY ("B") REFERENCES "UserTasks"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
