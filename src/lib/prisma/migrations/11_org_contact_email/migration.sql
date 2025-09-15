/*
  Warnings:

  - You are about to drop the column `OwnerId` on the `Organizations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Organizations" ADD COLUMN "ContactEmail" TEXT;

-- Populate ContactEmail values
UPDATE "public"."Organizations"
SET "ContactEmail" = u."Email"
FROM "public"."Users" u
WHERE "public"."Organizations"."OwnerId" = u."Id";

-- DropForeignKey
ALTER TABLE "public"."Organizations" DROP CONSTRAINT "FK_Organizations_Users_OwnerId";

-- DropIndex
DROP INDEX "public"."IX_Organizations_OwnerId";

-- AlterTable
ALTER TABLE "public"."Organizations" DROP COLUMN "OwnerId";

