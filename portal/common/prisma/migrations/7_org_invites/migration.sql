-- AlterTable
ALTER TABLE "OrganizationMembershipInvites"
ADD "Roles" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD "Groups" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
