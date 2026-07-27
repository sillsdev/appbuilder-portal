/*
  Warnings:

  - You are about to drop the column `ApplicationTypeId` on the `SoftwareUpdates` table. All the data in the column will be lost.
  - You are about to drop the column `BuildEngineUrl` on the `SoftwareUpdates` table. All the data in the column will be lost.
  - You are about to drop the column `DateUpdated` on the `SoftwareUpdates` table. All the data in the column will be lost.
  - You are about to drop the column `Version` on the `SoftwareUpdates` table. All the data in the column will be lost.
  - You are about to drop the `_ProductsToSoftwareUpdates` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `DateCreated` on table `SoftwareUpdates` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."SoftwareUpdates" DROP CONSTRAINT "SoftwareUpdates_ApplicationTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ProductsToSoftwareUpdates" DROP CONSTRAINT "_ProductsToSoftwareUpdates_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ProductsToSoftwareUpdates" DROP CONSTRAINT "_ProductsToSoftwareUpdates_B_fkey";

-- AlterTable
ALTER TABLE "SoftwareUpdates" DROP COLUMN "ApplicationTypeId",
DROP COLUMN "BuildEngineUrl",
DROP COLUMN "DateUpdated",
DROP COLUMN "Version",
DROP COLUMN "Paused",
ALTER COLUMN "DateCreated" SET NOT NULL;

-- AlterTable
ALTER TABLE "WorkflowInstances" ADD COLUMN     "SoftwareUpdateId" INTEGER;

-- DropTable
DROP TABLE "public"."_ProductsToSoftwareUpdates";

-- CreateTable
CREATE TABLE "SoftwareUpdatesOnProducts" (
    "SoftwareUpdateId" INTEGER NOT NULL,
    "ProductId" UUID NOT NULL,
    "DateCompleted" TIMESTAMP(3),
    "Version" TEXT NOT NULL,
    "Status" TEXT NOT NULL,

    CONSTRAINT "PK_SoftwareUpdatesOnProducts_SoftwareUpdateId_ProductId" PRIMARY KEY ("SoftwareUpdateId", "ProductId")
);

-- AddForeignKey
ALTER TABLE "SoftwareUpdatesOnProducts" ADD CONSTRAINT "FK_SoftwareUpdatesOnProducts_SoftwareUpdates_SoftwareUpdateId" FOREIGN KEY ("SoftwareUpdateId") REFERENCES "SoftwareUpdates"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SoftwareUpdatesOnProducts" ADD CONSTRAINT "FK_SoftwareUpdatesOnProducts_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "WorkflowInstances" ADD CONSTRAINT "FK_WorkflowInstances_SoftwareUpdates_SoftwareUpdateId" FOREIGN KEY ("SoftwareUpdateId") REFERENCES "SoftwareUpdates"("Id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- CreateIndex
CREATE INDEX "IX_SoftwareUpdatesOnProducts_Status" ON "SoftwareUpdatesOnProducts"("Status");
