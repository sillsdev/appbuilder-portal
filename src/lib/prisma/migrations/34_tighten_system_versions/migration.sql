-- Data in SystemStatuses will be recreated on startup
DELETE FROM "SystemStatuses";

-- AlterTable
ALTER TABLE "SystemStatuses" ADD COLUMN     "OrganizationId" INTEGER,
ALTER COLUMN "BuildEngineUrl" SET NOT NULL,
ALTER COLUMN "BuildEngineApiAccessToken" SET NOT NULL;

-- Data in SystemVersions will be recreated on startup
DELETE FROM "SystemVersions";

-- AlterTable
ALTER TABLE "SystemVersions" DROP CONSTRAINT "PK_SystemVersions_BuildEngineUrl_ApplicationTypeId",
DROP COLUMN "BuildEngineUrl",
ADD COLUMN     "SystemId" INTEGER NOT NULL,
ADD CONSTRAINT "PK_SystemVersions_SystemId_ApplicationTypeId" PRIMARY KEY ("SystemId", "ApplicationTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemStatuses_OrganizationId_key" ON "SystemStatuses"("OrganizationId");

-- AddForeignKey
ALTER TABLE "SystemStatuses" ADD CONSTRAINT "FK_SystemStatuses_Organizations_OrganizationId" FOREIGN KEY ("OrganizationId") REFERENCES "Organizations"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SystemVersions" ADD CONSTRAINT "FK_SystemVersions_SystemStatuses_SystemId" FOREIGN KEY ("SystemId") REFERENCES "SystemStatuses"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;
