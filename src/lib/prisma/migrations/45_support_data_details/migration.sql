-- Existing support requests are test data and have no reliable organization association.
DELETE FROM "SupportData";

-- Add project-style identifying details and organization association to support requests.
ALTER TABLE "SupportData"
ADD COLUMN "Name" TEXT NOT NULL,
ADD COLUMN "Description" TEXT,
ADD COLUMN "OrganizationId" INTEGER NOT NULL;

CREATE INDEX "IX_SupportData_OrganizationId" ON "SupportData"("OrganizationId");

ALTER TABLE "SupportData"
ADD CONSTRAINT "FK_SupportData_Organizations_OrganizationId"
FOREIGN KEY ("OrganizationId") REFERENCES "Organizations"("Id")
ON DELETE NO ACTION ON UPDATE NO ACTION;
