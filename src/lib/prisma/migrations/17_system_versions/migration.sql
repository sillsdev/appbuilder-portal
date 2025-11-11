-- CreateTable
CREATE TABLE "SystemVersions" (
    "BuildEngineUrl" TEXT NOT NULL,
    "ApplicationTypeId" INTEGER NOT NULL,
    "Version" TEXT DEFAULT '13.2',
    "DateCreated" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "DateUpdated" TIMESTAMP(6),

    CONSTRAINT "PK_SystemVersions_BuildEngineUrl_ApplicationTypeId" PRIMARY KEY ("BuildEngineUrl","ApplicationTypeId")
);

-- AddForeignKey
ALTER TABLE "SystemVersions" ADD CONSTRAINT "FK_SystemVersions_ApplicationTypes_ ApplicationTypeId" FOREIGN KEY ("ApplicationTypeId") REFERENCES "ApplicationTypes"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;
