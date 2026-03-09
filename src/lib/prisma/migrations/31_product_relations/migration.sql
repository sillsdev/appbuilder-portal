/*
  I manually edited this script to ensure that all fields are appropriately filled and primary keys are updated.
  There shouldn't be any products with a null StoreId.
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
-- Update BuildEngineBuildId with appropriate value
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
-- Update BuildEngineBuildId with appropriate value
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
