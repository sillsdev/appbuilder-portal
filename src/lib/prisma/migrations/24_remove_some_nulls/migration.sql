/*
  Warnings:

  - Made the column `Name` on table `ApplicationTypes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Name` on table `Groups` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Abbreviation` on table `Groups` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Name` on table `Organizations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `UseDefaultBuildEngine` on table `Organizations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `PublicByDefault` on table `Organizations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Name` on table `ProductDefinitions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Name` on table `Projects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Language` on table `Projects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `IsPublic` on table `Projects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `AllowDownloads` on table `Projects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `AutoPublishOnRebuild` on table `Projects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `RebuildOnSoftwareUpdate` on table `Projects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Name` on table `Reviewers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Email` on table `Reviewers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Locale` on table `Reviewers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Name` on table `StoreLanguages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Name` on table `StoreTypes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Name` on table `Stores` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Name` on table `WorkflowDefinitions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `StoreTypeId` on table `WorkflowDefinitions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ApplicationTypes" ALTER COLUMN "Name" SET NOT NULL;

-- AlterTable
ALTER TABLE "Groups" ALTER COLUMN "Name" SET NOT NULL,
ALTER COLUMN "Abbreviation" SET NOT NULL;

-- AlterTable
ALTER TABLE "Organizations" ALTER COLUMN "Name" SET NOT NULL,
ALTER COLUMN "UseDefaultBuildEngine" SET NOT NULL,
ALTER COLUMN "PublicByDefault" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProductDefinitions" ALTER COLUMN "Name" SET NOT NULL;

-- AlterTable
ALTER TABLE "Projects" ALTER COLUMN "Name" SET NOT NULL,
ALTER COLUMN "Language" SET NOT NULL,
ALTER COLUMN "IsPublic" SET NOT NULL,
ALTER COLUMN "AllowDownloads" SET NOT NULL,
ALTER COLUMN "AutoPublishOnRebuild" SET NOT NULL,
ALTER COLUMN "RebuildOnSoftwareUpdate" SET NOT NULL;

-- AlterTable
ALTER TABLE "Reviewers" ALTER COLUMN "Name" SET NOT NULL,
ALTER COLUMN "Email" SET NOT NULL,
ALTER COLUMN "Locale" SET NOT NULL;

-- AlterTable
ALTER TABLE "StoreLanguages" ALTER COLUMN "Name" SET NOT NULL;

-- AlterTable
ALTER TABLE "StoreTypes" ALTER COLUMN "Name" SET NOT NULL;

-- AlterTable
ALTER TABLE "Stores" ALTER COLUMN "Name" SET NOT NULL;

-- AlterTable
ALTER TABLE "WorkflowDefinitions" ALTER COLUMN "Name" SET NOT NULL,
ALTER COLUMN "StoreTypeId" SET NOT NULL;
