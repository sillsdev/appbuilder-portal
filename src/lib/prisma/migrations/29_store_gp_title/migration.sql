-- AlterTable
ALTER TABLE "Stores" ADD COLUMN "GooglePlayTitle" TEXT;
ALTER TABLE "Stores" RENAME COLUMN "Name" TO "BuildEnginePublisherId";
