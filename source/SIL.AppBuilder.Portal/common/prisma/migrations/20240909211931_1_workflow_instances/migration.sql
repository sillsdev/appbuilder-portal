/*
  Warnings:

  - You are about to drop the column `PublishAfterAutoRebuilds` on the `Projects` table. All the data in the column will be lost.
  - You are about to drop the column `SoftwareUpdateRebuilds` on the `Projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Projects" DROP COLUMN "PublishAfterAutoRebuilds",
DROP COLUMN "SoftwareUpdateRebuilds";

-- CreateTable
CREATE TABLE "WorkflowInstances" (
    "Id" SERIAL NOT NULL,
    "Snapshot" TEXT NOT NULL,
    "ProductId" UUID NOT NULL,

    CONSTRAINT "PK_WorkflowInstances" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowInstances_ProductId_key" ON "WorkflowInstances"("ProductId");

-- AddForeignKey
ALTER TABLE "WorkflowInstances" ADD CONSTRAINT "FK_WorkflowInstances_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;
