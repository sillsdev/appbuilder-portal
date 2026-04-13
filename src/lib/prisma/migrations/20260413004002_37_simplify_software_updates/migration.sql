/*
  Warnings:

  - You are about to drop the column `ApplicationTypeId` on the `SoftwareUpdates` table. All the data in the column will be lost.
  - You are about to drop the column `BuildEngineUrl` on the `SoftwareUpdates` table. All the data in the column will be lost.
  - You are about to drop the column `DateCompleted` on the `SoftwareUpdates` table. All the data in the column will be lost.
  - You are about to drop the column `DateUpdated` on the `SoftwareUpdates` table. All the data in the column will be lost.
  - You are about to drop the column `Version` on the `SoftwareUpdates` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SoftwareUpdates" DROP CONSTRAINT "SoftwareUpdates_ApplicationTypeId_fkey";

-- AlterTable
ALTER TABLE "SoftwareUpdates" DROP COLUMN "ApplicationTypeId",
DROP COLUMN "BuildEngineUrl",
DROP COLUMN "DateUpdated",
DROP COLUMN "Version";
