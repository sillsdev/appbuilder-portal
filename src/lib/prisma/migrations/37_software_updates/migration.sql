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
ALTER COLUMN "DateCreated" SET NOT NULL;

-- AlterTable
ALTER TABLE "WorkflowInstances" ADD COLUMN     "softwareUpdatesId" INTEGER;

-- DropTable
DROP TABLE "public"."_ProductsToSoftwareUpdates";

-- CreateTable
CREATE TABLE "SoftwareUpdatesOnProducts" (
    "softwareUpdateId" INTEGER NOT NULL,
    "productId" UUID NOT NULL,
    "DateCompleted" TIMESTAMP(3),
    "Version" TEXT NOT NULL,
    "Success" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SoftwareUpdatesOnProducts_pkey" PRIMARY KEY ("productId","softwareUpdateId")
);

-- AddForeignKey
ALTER TABLE "SoftwareUpdatesOnProducts" ADD CONSTRAINT "SoftwareUpdatesOnProducts_softwareUpdateId_fkey" FOREIGN KEY ("softwareUpdateId") REFERENCES "SoftwareUpdates"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareUpdatesOnProducts" ADD CONSTRAINT "SoftwareUpdatesOnProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowInstances" ADD CONSTRAINT "WorkflowInstances_softwareUpdatesId_fkey" FOREIGN KEY ("softwareUpdatesId") REFERENCES "SoftwareUpdates"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
