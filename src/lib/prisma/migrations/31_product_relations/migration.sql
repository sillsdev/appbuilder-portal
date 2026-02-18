/*
  Warnings:

  - The primary key for the `ProductArtifacts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ProductBuildId` on the `ProductArtifacts` table. All the data in the column will be lost.
  - The primary key for the `ProductBuilds` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `ProductBuilds` table. All the data in the column will be lost.
  - The primary key for the `ProductPublications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ProductBuildId` on the `ProductPublications` table. All the data in the column will be lost.
  - You are about to drop the column `BuildEngineBuildId` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the column `BuildEngineReleaseId` on the `Products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Id,CurrentBuildId]` on the table `Products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Id,CurrentReleaseId]` on the table `Products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `BuildEngineBuildId` to the `ProductArtifacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `BuildEngineBuildId` to the `ProductPublications` table without a default value. This is not possible if the table is not empty.
  - Made the column `StoreId` on table `Products` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."ProductArtifacts" DROP CONSTRAINT "FK_ProductArtifacts_ProductBuilds_ProductBuildId";

-- DropForeignKey
ALTER TABLE "public"."ProductPublications" DROP CONSTRAINT "FK_ProductPublications_ProductBuilds_ProductBuildId";

-- DropIndex
DROP INDEX "public"."IX_ProductBuilds_ProductId";

-- AlterTable
ALTER TABLE "ProductPublications" DROP CONSTRAINT "PK_ProductPublications_ProductBuildId_BuildEngineReleaseId";
ALTER TABLE "ProductPublications" ADD COLUMN  "BuildEngineBuildId" INTEGER;
ALTER TABLE "ProductPublications" ADD COLUMN  "PublishLink" TEXT;

UPDATE "ProductPublications"
SET "BuildEngineBuildId" = pb."BuildEngineBuildId"
FROM "ProductBuilds" pb
WHERE "ProductPublications"."ProductBuildId" = pb."Id";

ALTER TABLE "ProductPublications" DROP COLUMN "ProductBuildId",
ALTER COLUMN "BuildEngineBuildId" SET NOT NULL,
ADD CONSTRAINT "PK_ProductPublications_ProductId_BuildEngineReleaseId" PRIMARY KEY ("ProductId", "BuildEngineReleaseId");

-- AlterTable
ALTER TABLE "ProductArtifacts" DROP CONSTRAINT "PK_ProductArtifacts_ProductBuildId_ArtifactType";
ALTER TABLE "ProductArtifacts" ADD COLUMN  "BuildEngineBuildId" INTEGER;

UPDATE "ProductArtifacts"
SET "BuildEngineBuildId" = pb."BuildEngineBuildId"
FROM "ProductBuilds" pb
WHERE "ProductArtifacts"."ProductBuildId" = pb."Id";

ALTER TABLE "ProductArtifacts" DROP COLUMN "ProductBuildId",
ALTER COLUMN "BuildEngineBuildId" SET NOT NULL,
ADD CONSTRAINT "PK_ProductArtifacts_ProductId_BEBuildId_ArtifactType" PRIMARY KEY ("ProductId", "BuildEngineBuildId", "ArtifactType");

-- AlterTable
ALTER TABLE "ProductBuilds" DROP CONSTRAINT "PK_ProductBuilds";
ALTER TABLE "ProductBuilds" DROP COLUMN "Id";
ALTER TABLE "ProductBuilds" ADD CONSTRAINT "PK_ProductBuilds_ProductId_BuildEngineBuildId" PRIMARY KEY ("ProductId", "BuildEngineBuildId");

-- AlterTable
ALTER TABLE "Products" RENAME COLUMN "BuildEngineBuildId" TO "CurrentBuildId";
ALTER TABLE "Products" RENAME COLUMN "BuildEngineReleaseId" TO "CurrentReleaseId";
ALTER TABLE "Products" ALTER COLUMN "StoreId" SET NOT NULL, 
ALTER COLUMN "CurrentBuildId" DROP NOT NULL,
ALTER COLUMN "CurrentReleaseId" DROP NOT NULL;

UPDATE "Products" SET "CurrentBuildId" = NULL WHERE "CurrentBuildId" = 0;
UPDATE "Products" SET "CurrentReleaseId" = NULL WHERE "CurrentReleaseId" = 0;

-- CreateIndex
CREATE INDEX "IX_ProductPublications_BuildEngineBuildId" ON "ProductPublications"("BuildEngineBuildId");

-- CreateIndex
CREATE UNIQUE INDEX "Products_Id_CurrentBuildId_key" ON "Products"("Id", "CurrentBuildId");

-- CreateIndex
CREATE UNIQUE INDEX "Products_Id_CurrentReleaseId_key" ON "Products"("Id", "CurrentReleaseId");

-- AddForeignKey
ALTER TABLE "ProductArtifacts" ADD CONSTRAINT "FK_ProductArtifacts_ProductBuilds_ProductId_BuildEngineBuildId" FOREIGN KEY ("ProductId", "BuildEngineBuildId") REFERENCES "ProductBuilds"("ProductId", "BuildEngineBuildId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductPublications" ADD CONSTRAINT "FK_ProductPublications_ProductBuilds_ProductId_BEBuildId" FOREIGN KEY ("ProductId", "BuildEngineBuildId") REFERENCES "ProductBuilds"("ProductId", "BuildEngineBuildId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "FK_Products_ProductBuilds_CurrentBuildId" FOREIGN KEY ("Id", "CurrentBuildId") REFERENCES "ProductBuilds"("ProductId", "BuildEngineBuildId") ON DELETE SET NULL ("CurrentBuildId") ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "FK_Products_ProductPublications_CurrentReleaseId" FOREIGN KEY ("Id", "CurrentReleaseId") REFERENCES "ProductPublications"("ProductId", "BuildEngineReleaseId") ON DELETE SET NULL ("CurrentReleaseId") ON UPDATE NO ACTION;
