/*
  Warnings:

  - You are about to drop the column `WorkflowUserId` on the `ProductTransitions` table. All the data in the column will be lost.
  - You are about to drop the column `WorkflowUserId` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `WorkflowBusinessFlow` on the `WorkflowDefinitions` table. All the data in the column will be lost.
  - You are about to drop the column `WorkflowScheme` on the `WorkflowDefinitions` table. All the data in the column will be lost.
  - You are about to drop the `WorkflowGlobalParameter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowInbox` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowProcessInstance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowProcessInstancePersistence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowProcessInstanceStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowProcessScheme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowProcessTimer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowProcessTransitionHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowScheme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `__EFMigrationsHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dwAppSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dwSecurityCredential` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dwSecurityGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dwSecurityGroupToSecurityRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dwSecurityGroupToSecurityUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dwSecurityPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dwSecurityPermissionGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dwSecurityRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dwSecurityRoleToSecurityPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dwSecurityUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dwSecurityUserImpersonation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dwSecurityUserState` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dwSecurityUserToSecurityRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dwUploadedFiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."dwSecurityCredential" DROP CONSTRAINT "dwSecurityCredential_SecurityUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dwSecurityGroupToSecurityRole" DROP CONSTRAINT "dwSecurityGroupToSecurityRole_SecurityGroupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dwSecurityGroupToSecurityRole" DROP CONSTRAINT "dwSecurityGroupToSecurityRole_SecurityRoleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dwSecurityGroupToSecurityUser" DROP CONSTRAINT "dwSecurityGroupToSecurityUser_SecurityGroupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dwSecurityGroupToSecurityUser" DROP CONSTRAINT "dwSecurityGroupToSecurityUser_SecurityUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dwSecurityPermission" DROP CONSTRAINT "dwSecurityPermission_GroupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dwSecurityRoleToSecurityPermission" DROP CONSTRAINT "dwSecurityRoleToSecurityPermission_SecurityPermissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dwSecurityRoleToSecurityPermission" DROP CONSTRAINT "dwSecurityRoleToSecurityPermission_SecurityRoleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dwSecurityUserImpersonation" DROP CONSTRAINT "dwSecurityUserImpersonation_ImpSecurityUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dwSecurityUserImpersonation" DROP CONSTRAINT "dwSecurityUserImpersonation_SecurityUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dwSecurityUserState" DROP CONSTRAINT "dwSecurityUserState_SecurityUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dwSecurityUserToSecurityRole" DROP CONSTRAINT "dwSecurityUserToSecurityRole_SecurityRoleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dwSecurityUserToSecurityRole" DROP CONSTRAINT "dwSecurityUserToSecurityRole_SecurityUserId_fkey";

-- DropIndex
DROP INDEX "public"."IX_Users_WorkflowUserId";

-- AlterTable
ALTER TABLE "ProductTransitions" DROP COLUMN "WorkflowUserId";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "WorkflowUserId";

-- AlterTable
ALTER TABLE "WorkflowDefinitions" DROP COLUMN "WorkflowBusinessFlow",
DROP COLUMN "WorkflowScheme";

-- DropTable
DROP TABLE "public"."WorkflowGlobalParameter";

-- DropTable
DROP TABLE "public"."WorkflowInbox";

-- DropTable
DROP TABLE "public"."WorkflowProcessInstance";

-- DropTable
DROP TABLE "public"."WorkflowProcessInstancePersistence";

-- DropTable
DROP TABLE "public"."WorkflowProcessInstanceStatus";

-- DropTable
DROP TABLE "public"."WorkflowProcessScheme";

-- DropTable
DROP TABLE "public"."WorkflowProcessTimer";

-- DropTable
DROP TABLE "public"."WorkflowProcessTransitionHistory";

-- DropTable
DROP TABLE "public"."WorkflowScheme";

-- DropTable
DROP TABLE "public"."__EFMigrationsHistory";

-- DropTable
DROP TABLE "public"."dwAppSettings";

-- DropTable
DROP TABLE "public"."dwSecurityCredential";

-- DropTable
DROP TABLE "public"."dwSecurityGroup";

-- DropTable
DROP TABLE "public"."dwSecurityGroupToSecurityRole";

-- DropTable
DROP TABLE "public"."dwSecurityGroupToSecurityUser";

-- DropTable
DROP TABLE "public"."dwSecurityPermission";

-- DropTable
DROP TABLE "public"."dwSecurityPermissionGroup";

-- DropTable
DROP TABLE "public"."dwSecurityRole";

-- DropTable
DROP TABLE "public"."dwSecurityRoleToSecurityPermission";

-- DropTable
DROP TABLE "public"."dwSecurityUser";

-- DropTable
DROP TABLE "public"."dwSecurityUserImpersonation";

-- DropTable
DROP TABLE "public"."dwSecurityUserState";

-- DropTable
DROP TABLE "public"."dwSecurityUserToSecurityRole";

-- DropTable
DROP TABLE "public"."dwUploadedFiles";
