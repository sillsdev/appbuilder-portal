-- AlterTable
ALTER TABLE "Stores" ADD COLUMN "GooglePlayTitle" TEXT;

-- AlterTable
ALTER TABLE "Stores" RENAME COLUMN "Name" TO "BuildEnginePublisherId";

-- AlterTable
ALTER TABLE "Stores" ADD COLUMN     "OwnerId" INTEGER;

-- AddForeignKey
ALTER TABLE "Stores" ADD CONSTRAINT "FK_Stores_Organizations_OwnerId" FOREIGN KEY ("OwnerId") REFERENCES "Organizations"("Id") ON DELETE SET NULL ON UPDATE NO ACTION;