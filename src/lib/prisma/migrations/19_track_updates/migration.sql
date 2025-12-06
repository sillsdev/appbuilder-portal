-- CreateTable
CREATE TABLE "SoftwareUpdates" (
    "Id" SERIAL NOT NULL,
    "InitiatedById" INTEGER NOT NULL,
    "Comment" TEXT NOT NULL,
    "Paused" BOOLEAN NOT NULL DEFAULT false,
    "DateCreated" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "DateUpdated" TIMESTAMP(6),
    "DateCompleted" TIMESTAMP(6),
    "BuildEngineUrl" TEXT NOT NULL,
    "ApplicationTypeId" INTEGER NOT NULL,
    "Version" TEXT NOT NULL,

    CONSTRAINT "PK_SoftwareUpdates" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "_ProductsToSoftwareUpdates" (
    "A" UUID NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProductsToSoftwareUpdates_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProductsToSoftwareUpdates_B_index" ON "_ProductsToSoftwareUpdates"("B");

-- AddForeignKey
ALTER TABLE "SoftwareUpdates" ADD CONSTRAINT "SoftwareUpdates_InitiatedById_fkey" FOREIGN KEY ("InitiatedById") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareUpdates" ADD CONSTRAINT "SoftwareUpdates_ApplicationTypeId_fkey" FOREIGN KEY ("ApplicationTypeId") REFERENCES "ApplicationTypes"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductsToSoftwareUpdates" ADD CONSTRAINT "_ProductsToSoftwareUpdates_A_fkey" FOREIGN KEY ("A") REFERENCES "Products"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductsToSoftwareUpdates" ADD CONSTRAINT "_ProductsToSoftwareUpdates_B_fkey" FOREIGN KEY ("B") REFERENCES "SoftwareUpdates"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
