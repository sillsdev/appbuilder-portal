-- Add project-style identifying details to support requests.
ALTER TABLE "SupportData"
ADD COLUMN "Name" TEXT NOT NULL DEFAULT 'Support request',
ADD COLUMN "Description" TEXT;

ALTER TABLE "SupportData"
ALTER COLUMN "Name" DROP DEFAULT;