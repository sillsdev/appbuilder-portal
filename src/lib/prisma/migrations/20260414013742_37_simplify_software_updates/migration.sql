/*
  Warnings:

  - You are about to drop the column `ApplicationTypeId` on the `SoftwareUpdates` table. All the data in the column will be lost.
  - You are about to drop the column `BuildEngineUrl` on the `SoftwareUpdates` table. All the data in the column will be lost.
  - You are about to drop the column `DateUpdated` on the `SoftwareUpdates` table. All the data in the column will be lost.
  - You are about to drop the column `Version` on the `SoftwareUpdates` table. All the data in the column will be lost.
  - Made the column `DateCreated` on table `SoftwareUpdates` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."SoftwareUpdates" DROP CONSTRAINT "SoftwareUpdates_ApplicationTypeId_fkey";

-- AlterTable
ALTER TABLE "SoftwareUpdates" DROP COLUMN "ApplicationTypeId",
DROP COLUMN "BuildEngineUrl",
DROP COLUMN "DateUpdated",
DROP COLUMN "Version",
ALTER COLUMN "DateCreated" SET NOT NULL;
