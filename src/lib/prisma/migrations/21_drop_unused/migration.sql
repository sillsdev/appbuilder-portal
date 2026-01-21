/*
  Warnings:

  - You are about to drop the column `TypeId` on the `ProductDefinitions` table. All the data in the column will be lost.
  - You are about to drop the column `WorkflowComment` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the `Emails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationInviteRequests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationInvites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Notifications" DROP CONSTRAINT "FK_Notifications_Users_UserId";

-- DropForeignKey
ALTER TABLE "public"."ProductDefinitions" DROP CONSTRAINT "FK_ProductDefinitions_ApplicationTypes_TypeId";

-- DropForeignKey
ALTER TABLE "public"."UserRoles" DROP CONSTRAINT "FK_UserRoles_Roles_RoleId";

-- DropIndex
DROP INDEX "public"."IX_ProductDefinitions_TypeId";

-- AlterTable
ALTER TABLE "ProductDefinitions" DROP COLUMN "TypeId";

-- AlterTable
ALTER TABLE "Products" DROP COLUMN "WorkflowComment";

-- DropTable
DROP TABLE "public"."Emails";

-- DropTable
DROP TABLE "public"."Notifications";

-- DropTable
DROP TABLE "public"."OrganizationInviteRequests";

-- DropTable
DROP TABLE "public"."OrganizationInvites";

-- DropTable
DROP TABLE "public"."Roles";
