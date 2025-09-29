/*
  Warnings:

  - You are about to drop the column `AutomaticBuilds` on the `Projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Projects" DROP COLUMN "AutomaticBuilds",
ADD COLUMN     "AutoPublishOnRebuild" BOOLEAN DEFAULT false,
ADD COLUMN     "RebuildOnSoftwareUpdate" BOOLEAN DEFAULT false;
