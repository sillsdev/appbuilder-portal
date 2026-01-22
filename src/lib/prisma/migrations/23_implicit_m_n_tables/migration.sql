/*
  Warnings:

  - The primary key for the `Authors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `Authors` table. All the data in the column will be lost.
  - The primary key for the `OrganizationMembershipInvites` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `OrganizationMembershipInvites` table. All the data in the column will be lost.
  - The primary key for the `ProductArtifacts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `ProductArtifacts` table. All the data in the column will be lost.
  - The primary key for the `ProductPublications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `ProductPublications` table. All the data in the column will be lost.
  - The primary key for the `UserRoles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `UserRoles` table. All the data in the column will be lost.
  - The primary key for the `WorkflowInstances` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `WorkflowInstances` table. All the data in the column will be lost.
  - You are about to drop the `GroupMemberships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationMemberships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationProductDefinitions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationStores` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `ArtifactType` on table `ProductArtifacts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."GroupMemberships" DROP CONSTRAINT "FK_GroupMemberships_Groups_GroupId";

-- DropForeignKey
ALTER TABLE "public"."GroupMemberships" DROP CONSTRAINT "FK_GroupMemberships_Users_UserId";

-- DropForeignKey
ALTER TABLE "public"."OrganizationMemberships" DROP CONSTRAINT "FK_OrganizationMemberships_Organizations_OrganizationId";

-- DropForeignKey
ALTER TABLE "public"."OrganizationMemberships" DROP CONSTRAINT "FK_OrganizationMemberships_Users_UserId";

-- DropForeignKey
ALTER TABLE "public"."OrganizationProductDefinitions" DROP CONSTRAINT "FK_OrganizationProductDefinitions_Organizations_OrganizationId";

-- DropForeignKey
ALTER TABLE "public"."OrganizationProductDefinitions" DROP CONSTRAINT "FK_OrganizationProductDefinitions_ProductDefinitions_ProductDe~";

-- DropForeignKey
ALTER TABLE "public"."OrganizationStores" DROP CONSTRAINT "FK_OrganizationStores_Organizations_OrganizationId";

-- DropForeignKey
ALTER TABLE "public"."OrganizationStores" DROP CONSTRAINT "FK_OrganizationStores_Stores_StoreId";

-- DropIndex
DROP INDEX "public"."IX_Authors_ProjectId";

-- DropIndex
DROP INDEX "public"."IX_Authors_UserId";

-- DropIndex
DROP INDEX "public"."IX_ProductArtifacts_ProductBuildId";

-- DropIndex
DROP INDEX "public"."IX_ProductPublications_ProductBuildId";

-- DropIndex
DROP INDEX "public"."IX_UserRoles_OrganizationId";

-- DropIndex
DROP INDEX "public"."IX_UserRoles_RoleId";

-- DropIndex
DROP INDEX "public"."IX_UserRoles_UserId";

-- DropIndex
DROP INDEX "public"."WorkflowInstances_ProductId_key";

-- AlterTable
ALTER TABLE "Authors" DROP CONSTRAINT "PK_Authors",
DROP COLUMN "Id",
ADD CONSTRAINT "PK_Authors_UserId_ProjectId" PRIMARY KEY ("UserId", "ProjectId");

-- AlterTable
ALTER TABLE "OrganizationMembershipInvites" DROP CONSTRAINT "PK_OrganizationMembershipInvites",
DROP COLUMN "Id",
ADD CONSTRAINT "PK_OrganizationMembershipInvites" PRIMARY KEY ("Token");

-- AlterTable
ALTER TABLE "ProductArtifacts" DROP CONSTRAINT "PK_ProductArtifacts",
DROP COLUMN "Id",
ALTER COLUMN "ArtifactType" SET NOT NULL,
ADD CONSTRAINT "PK_ProductArtifacts_ProductBuildId_ArtifactType" PRIMARY KEY ("ProductBuildId", "ArtifactType");

-- AlterTable
ALTER TABLE "ProductPublications" DROP CONSTRAINT "PK_ProductPublications",
DROP COLUMN "Id",
ADD CONSTRAINT "PK_ProductPublications_ProductBuildId_BuildEngineReleaseId" PRIMARY KEY ("ProductBuildId", "BuildEngineReleaseId");

-- AlterTable
ALTER TABLE "UserRoles" DROP CONSTRAINT "PK_UserRoles",
DROP COLUMN "Id",
ADD CONSTRAINT "PK_UserRoles_UserId_RoleId_OrganizationId" PRIMARY KEY ("UserId", "RoleId", "OrganizationId");

-- AlterTable
ALTER TABLE "WorkflowInstances" DROP CONSTRAINT "PK_WorkflowInstances",
DROP COLUMN "Id",
ADD CONSTRAINT "PK_WorkflowInstances" PRIMARY KEY ("ProductId");

-- CreateTable
CREATE TABLE "_GroupsToUsers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GroupsToUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrganizationsToUsers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OrganizationsToUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrganizationsToProductDefinitions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OrganizationsToProductDefinitions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrganizationsToStores" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OrganizationsToStores_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroupsToUsers_B_index" ON "_GroupsToUsers"("B");

-- CreateIndex
CREATE INDEX "_OrganizationsToUsers_B_index" ON "_OrganizationsToUsers"("B");

-- CreateIndex
CREATE INDEX "_OrganizationsToProductDefinitions_B_index" ON "_OrganizationsToProductDefinitions"("B");

-- CreateIndex
CREATE INDEX "_OrganizationsToStores_B_index" ON "_OrganizationsToStores"("B");

-- AddForeignKey
ALTER TABLE "_GroupsToUsers" ADD CONSTRAINT "_GroupsToUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Groups"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupsToUsers" ADD CONSTRAINT "_GroupsToUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationsToUsers" ADD CONSTRAINT "_OrganizationsToUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Organizations"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationsToUsers" ADD CONSTRAINT "_OrganizationsToUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationsToProductDefinitions" ADD CONSTRAINT "_OrganizationsToProductDefinitions_A_fkey" FOREIGN KEY ("A") REFERENCES "Organizations"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationsToProductDefinitions" ADD CONSTRAINT "_OrganizationsToProductDefinitions_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductDefinitions"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationsToStores" ADD CONSTRAINT "_OrganizationsToStores_A_fkey" FOREIGN KEY ("A") REFERENCES "Organizations"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationsToStores" ADD CONSTRAINT "_OrganizationsToStores_B_fkey" FOREIGN KEY ("B") REFERENCES "Stores"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Inserts
INSERT INTO "_GroupsToUsers" ("A", "B") SELECT "GroupId", "UserId" FROM "public"."GroupMemberships" ON CONFLICT DO NOTHING;
INSERT INTO "_OrganizationsToUsers" ("A", "B") SELECT "OrganizationId", "UserId" FROM "public"."OrganizationMemberships" ON CONFLICT DO NOTHING;
INSERT INTO "_OrganizationsToProductDefinitions" ("A", "B") SELECT "OrganizationId", "ProductDefinitionId" FROM "public"."OrganizationProductDefinitions" ON CONFLICT DO NOTHING;
INSERT INTO "_OrganizationsToStores" ("A", "B") SELECT "OrganizationId", "StoreId" FROM "public"."OrganizationStores" ON CONFLICT DO NOTHING;

-- DropTable
DROP TABLE "public"."GroupMemberships";

-- DropTable
DROP TABLE "public"."OrganizationMemberships";

-- DropTable
DROP TABLE "public"."OrganizationProductDefinitions";

-- DropTable
DROP TABLE "public"."OrganizationStores";