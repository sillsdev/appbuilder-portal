-- Data in SystemStatuses will be recreated on startup
DELETE FROM "SystemStatuses";

-- AlterTable
ALTER TABLE "SystemStatuses"
ADD COLUMN "Default" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "BuildEngineUrl" SET NOT NULL,
ALTER COLUMN "BuildEngineApiAccessToken" SET NOT NULL;

-- Data in SystemVersions will be recreated on startup
DELETE FROM "SystemVersions";

-- AlterTable
ALTER TABLE "Organizations" ADD COLUMN "SystemId" INTEGER;

-- AlterTable
ALTER TABLE "SystemVersions"
DROP CONSTRAINT "PK_SystemVersions_BuildEngineUrl_ApplicationTypeId",
DROP COLUMN "BuildEngineUrl",
ADD COLUMN "SystemId" INTEGER NOT NULL,
ADD CONSTRAINT "PK_SystemVersions_SystemId_ApplicationTypeId" PRIMARY KEY ("SystemId", "ApplicationTypeId");

-- AddForeignKey
ALTER TABLE "Organizations" ADD CONSTRAINT "FK_Organizations_SystemStatuses_SystemStatusId" FOREIGN KEY ("SystemId") REFERENCES "SystemStatuses" ("Id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SystemVersions" ADD CONSTRAINT "FK_SystemVersions_SystemStatuses_SystemId" FOREIGN KEY ("SystemId") REFERENCES "SystemStatuses" ("Id") ON DELETE CASCADE ON UPDATE NO ACTION;