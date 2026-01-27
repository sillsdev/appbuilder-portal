-- CreateTable
CREATE TABLE "_ApplicationTypesToProductDefinitions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ApplicationTypesToProductDefinitions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ApplicationTypesToProductDefinitions_B_index" ON "_ApplicationTypesToProductDefinitions"("B");

-- AddForeignKey
ALTER TABLE "_ApplicationTypesToProductDefinitions" ADD CONSTRAINT "_ApplicationTypesToProductDefinitions_A_fkey" FOREIGN KEY ("A") REFERENCES "ApplicationTypes"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationTypesToProductDefinitions" ADD CONSTRAINT "_ApplicationTypesToProductDefinitions_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductDefinitions"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "ProductDefinitions" ADD COLUMN     "AllowAllApplicationTypes" BOOLEAN NOT NULL DEFAULT true;
