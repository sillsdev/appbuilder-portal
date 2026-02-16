/*
  Warnings:

  - The primary key for the `ProductUserChanges` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `Id` column on the `ProductUserChanges` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ProductUserChanges" DROP CONSTRAINT "PK_ProductUserChanges",
DROP COLUMN "Id",
ADD COLUMN     "Id" UUID NOT NULL DEFAULT uuid_generate_v4(),
ADD CONSTRAINT "PK_ProductUserChanges" PRIMARY KEY ("Id");
