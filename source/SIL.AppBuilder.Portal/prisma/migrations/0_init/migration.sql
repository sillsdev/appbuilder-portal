-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "ApplicationTypes" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "Description" TEXT,

    CONSTRAINT "PK_ApplicationTypes" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Authors" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "ProjectId" INTEGER NOT NULL,
    "CanUpdate" BOOLEAN,

    CONSTRAINT "PK_Authors" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Emails" (
    "Id" SERIAL NOT NULL,
    "To" TEXT,
    "Cc" TEXT,
    "Bcc" TEXT,
    "Subject" TEXT,
    "ContentTemplate" TEXT,
    "ContentModelJson" TEXT,
    "Created" TIMESTAMP NOT NULL,

    CONSTRAINT "PK_Emails" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "GroupMemberships" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "GroupId" INTEGER NOT NULL,

    CONSTRAINT "PK_GroupMemberships" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Groups" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "Abbreviation" TEXT,
    "OwnerId" INTEGER NOT NULL,

    CONSTRAINT "PK_Groups" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "Id" SERIAL NOT NULL,
    "MessageId" TEXT,
    "UserId" INTEGER NOT NULL,
    "DateRead" TIMESTAMP,
    "DateEmailSent" TIMESTAMP,
    "DateCreated" TIMESTAMP,
    "DateUpdated" TIMESTAMP,
    "Message" TEXT,
    "MessageSubstitutionsJson" TEXT,
    "SendEmail" BOOLEAN NOT NULL,
    "LinkUrl" TEXT,

    CONSTRAINT "PK_Notifications" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OrganizationInviteRequests" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "OrgAdminEmail" TEXT,
    "WebsiteUrl" TEXT,
    "DateCreated" TIMESTAMP,
    "DateUpdated" TIMESTAMP,

    CONSTRAINT "PK_OrganizationInviteRequests" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OrganizationInvites" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "OwnerEmail" TEXT,
    "Token" TEXT,

    CONSTRAINT "PK_OrganizationInvites" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OrganizationMembershipInvites" (
    "Id" SERIAL NOT NULL,
    "Token" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "Email" TEXT NOT NULL,
    "Expires" TIMESTAMP NOT NULL DEFAULT (CURRENT_DATE + 7),
    "Redeemed" BOOLEAN NOT NULL DEFAULT false,
    "InvitedById" INTEGER NOT NULL,
    "OrganizationId" INTEGER NOT NULL,
    "DateCreated" TIMESTAMP,
    "DateUpdated" TIMESTAMP,

    CONSTRAINT "PK_OrganizationMembershipInvites" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OrganizationMemberships" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "OrganizationId" INTEGER NOT NULL,

    CONSTRAINT "PK_OrganizationMemberships" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OrganizationProductDefinitions" (
    "Id" SERIAL NOT NULL,
    "OrganizationId" INTEGER NOT NULL,
    "ProductDefinitionId" INTEGER NOT NULL,

    CONSTRAINT "PK_OrganizationProductDefinitions" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OrganizationStores" (
    "Id" SERIAL NOT NULL,
    "OrganizationId" INTEGER NOT NULL,
    "StoreId" INTEGER NOT NULL,

    CONSTRAINT "PK_OrganizationStores" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Organizations" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "WebsiteUrl" TEXT,
    "BuildEngineUrl" TEXT,
    "BuildEngineApiAccessToken" TEXT,
    "LogoUrl" TEXT,
    "UseDefaultBuildEngine" BOOLEAN DEFAULT true,
    "PublicByDefault" BOOLEAN DEFAULT true,
    "OwnerId" INTEGER NOT NULL,

    CONSTRAINT "PK_Organizations" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProductArtifacts" (
    "Id" SERIAL NOT NULL,
    "ProductId" UUID NOT NULL,
    "ProductBuildId" INTEGER NOT NULL,
    "ArtifactType" TEXT,
    "Url" TEXT,
    "FileSize" BIGINT,
    "ContentType" TEXT,
    "DateCreated" TIMESTAMP,
    "DateUpdated" TIMESTAMP,

    CONSTRAINT "PK_ProductArtifacts" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProductBuilds" (
    "Id" SERIAL NOT NULL,
    "ProductId" UUID NOT NULL,
    "BuildId" INTEGER NOT NULL,
    "Version" TEXT,
    "DateCreated" TIMESTAMP,
    "DateUpdated" TIMESTAMP,
    "Success" BOOLEAN,

    CONSTRAINT "PK_ProductBuilds" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProductDefinitions" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "TypeId" INTEGER NOT NULL,
    "Description" TEXT,
    "WorkflowId" INTEGER NOT NULL,
    "RebuildWorkflowId" INTEGER,
    "RepublishWorkflowId" INTEGER,
    "Properties" TEXT,

    CONSTRAINT "PK_ProductDefinitions" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProductPublications" (
    "Id" SERIAL NOT NULL,
    "ProductId" UUID NOT NULL,
    "ProductBuildId" INTEGER NOT NULL,
    "ReleaseId" INTEGER NOT NULL,
    "Channel" TEXT,
    "LogUrl" TEXT,
    "Success" BOOLEAN,
    "DateCreated" TIMESTAMP,
    "DateUpdated" TIMESTAMP,
    "Package" TEXT,

    CONSTRAINT "PK_ProductPublications" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProductTransitions" (
    "Id" SERIAL NOT NULL,
    "ProductId" UUID NOT NULL,
    "WorkflowUserId" UUID,
    "AllowedUserNames" TEXT,
    "InitialState" TEXT,
    "DestinationState" TEXT,
    "Command" TEXT,
    "DateTransition" TIMESTAMP,
    "Comment" TEXT,
    "TransitionType" INTEGER NOT NULL DEFAULT 1,
    "WorkflowType" INTEGER,

    CONSTRAINT "PK_ProductTransitions" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Products" (
    "Id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "ProjectId" INTEGER NOT NULL,
    "ProductDefinitionId" INTEGER NOT NULL,
    "StoreId" INTEGER,
    "StoreLanguageId" INTEGER,
    "DateCreated" TIMESTAMP,
    "DateUpdated" TIMESTAMP,
    "WorkflowJobId" INTEGER NOT NULL,
    "WorkflowBuildId" INTEGER NOT NULL,
    "DateBuilt" TIMESTAMP,
    "WorkflowPublishId" INTEGER NOT NULL,
    "WorkflowComment" TEXT,
    "DatePublished" TIMESTAMP,
    "PublishLink" TEXT,
    "VersionBuilt" TEXT,
    "Properties" TEXT,

    CONSTRAINT "PK_Products" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProjectImports" (
    "Id" SERIAL NOT NULL,
    "ImportData" TEXT,
    "TypeId" INTEGER,
    "OwnerId" INTEGER,
    "GroupId" INTEGER,
    "OrganizationId" INTEGER,
    "DateCreated" TIMESTAMP,
    "DateUpdated" TIMESTAMP,

    CONSTRAINT "PK_ProjectImports" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Projects" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "TypeId" INTEGER NOT NULL,
    "Description" TEXT,
    "OwnerId" INTEGER NOT NULL,
    "GroupId" INTEGER NOT NULL,
    "OrganizationId" INTEGER NOT NULL,
    "Language" TEXT,
    "IsPublic" BOOLEAN DEFAULT true,
    "DateCreated" TIMESTAMP,
    "DateUpdated" TIMESTAMP,
    "DateArchived" TIMESTAMP,
    "AllowDownloads" BOOLEAN DEFAULT true,
    "AutomaticBuilds" BOOLEAN DEFAULT true,
    "WorkflowProjectId" INTEGER NOT NULL DEFAULT 0,
    "WorkflowProjectUrl" TEXT,
    "WorkflowAppProjectUrl" TEXT,
    "DateActive" TIMESTAMP,
    "ImportId" INTEGER,
    "PublishAfterAutoRebuilds" BOOLEAN,
    "SoftwareUpdateRebuilds" BOOLEAN,

    CONSTRAINT "PK_Projects" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Reviewers" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "Email" TEXT,
    "ProjectId" INTEGER NOT NULL,
    "Locale" TEXT,

    CONSTRAINT "PK_Reviewers" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Roles" (
    "Id" SERIAL NOT NULL,
    "RoleName" INTEGER NOT NULL,

    CONSTRAINT "PK_Roles" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "StoreLanguages" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "Description" TEXT,
    "StoreTypeId" INTEGER NOT NULL,

    CONSTRAINT "PK_StoreLanguages" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "StoreTypes" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "Description" TEXT,

    CONSTRAINT "PK_StoreTypes" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Stores" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "Description" TEXT,
    "StoreTypeId" INTEGER NOT NULL,

    CONSTRAINT "PK_Stores" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "SystemStatuses" (
    "Id" SERIAL NOT NULL,
    "BuildEngineUrl" TEXT,
    "BuildEngineApiAccessToken" TEXT,
    "SystemAvailable" BOOLEAN NOT NULL,
    "DateCreated" TIMESTAMP,
    "DateUpdated" TIMESTAMP,

    CONSTRAINT "PK_SystemStatuses" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserRoles" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "RoleId" INTEGER NOT NULL,
    "OrganizationId" INTEGER NOT NULL,

    CONSTRAINT "PK_UserRoles" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserTasks" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "ProductId" UUID NOT NULL,
    "ActivityName" TEXT,
    "Status" TEXT,
    "Comment" TEXT,
    "DateCreated" TIMESTAMP,
    "DateUpdated" TIMESTAMP,

    CONSTRAINT "PK_UserTasks" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Users" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "GivenName" TEXT,
    "FamilyName" TEXT,
    "Email" TEXT,
    "Phone" TEXT,
    "Timezone" TEXT,
    "Locale" TEXT,
    "IsLocked" BOOLEAN NOT NULL,
    "ExternalId" TEXT,
    "ProfileVisibility" INTEGER NOT NULL DEFAULT 1,
    "EmailNotification" BOOLEAN DEFAULT true,
    "WorkflowUserId" UUID,
    "DateCreated" TIMESTAMP,
    "DateUpdated" TIMESTAMP,

    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "WorkflowDefinitions" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "Enabled" BOOLEAN NOT NULL,
    "Description" TEXT,
    "WorkflowScheme" TEXT,
    "WorkflowBusinessFlow" TEXT,
    "StoreTypeId" INTEGER,
    "Type" INTEGER NOT NULL DEFAULT 1,
    "Properties" TEXT,

    CONSTRAINT "PK_WorkflowDefinitions" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE INDEX "IX_Authors_ProjectId" ON "Authors"("ProjectId");

-- CreateIndex
CREATE INDEX "IX_Authors_UserId" ON "Authors"("UserId");

-- CreateIndex
CREATE INDEX "IX_GroupMemberships_GroupId" ON "GroupMemberships"("GroupId");

-- CreateIndex
CREATE INDEX "IX_GroupMemberships_UserId" ON "GroupMemberships"("UserId");

-- CreateIndex
CREATE INDEX "IX_Groups_OwnerId" ON "Groups"("OwnerId");

-- CreateIndex
CREATE INDEX "IX_Notifications_UserId" ON "Notifications"("UserId");

-- CreateIndex
CREATE INDEX "IX_OrganizationMembershipInvites_InvitedById" ON "OrganizationMembershipInvites"("InvitedById");

-- CreateIndex
CREATE INDEX "IX_OrganizationMembershipInvites_OrganizationId" ON "OrganizationMembershipInvites"("OrganizationId");

-- CreateIndex
CREATE INDEX "IX_OrganizationMemberships_OrganizationId" ON "OrganizationMemberships"("OrganizationId");

-- CreateIndex
CREATE INDEX "IX_OrganizationMemberships_UserId" ON "OrganizationMemberships"("UserId");

-- CreateIndex
CREATE INDEX "IX_OrganizationProductDefinitions_OrganizationId" ON "OrganizationProductDefinitions"("OrganizationId");

-- CreateIndex
CREATE INDEX "IX_OrganizationProductDefinitions_ProductDefinitionId" ON "OrganizationProductDefinitions"("ProductDefinitionId");

-- CreateIndex
CREATE INDEX "IX_OrganizationStores_OrganizationId" ON "OrganizationStores"("OrganizationId");

-- CreateIndex
CREATE INDEX "IX_OrganizationStores_StoreId" ON "OrganizationStores"("StoreId");

-- CreateIndex
CREATE INDEX "IX_Organizations_OwnerId" ON "Organizations"("OwnerId");

-- CreateIndex
CREATE INDEX "IX_ProductArtifacts_ProductBuildId" ON "ProductArtifacts"("ProductBuildId");

-- CreateIndex
CREATE INDEX "IX_ProductArtifacts_ProductId" ON "ProductArtifacts"("ProductId");

-- CreateIndex
CREATE INDEX "IX_ProductBuilds_ProductId" ON "ProductBuilds"("ProductId");

-- CreateIndex
CREATE INDEX "IX_ProductDefinitions_RebuildWorkflowId" ON "ProductDefinitions"("RebuildWorkflowId");

-- CreateIndex
CREATE INDEX "IX_ProductDefinitions_RepublishWorkflowId" ON "ProductDefinitions"("RepublishWorkflowId");

-- CreateIndex
CREATE INDEX "IX_ProductDefinitions_TypeId" ON "ProductDefinitions"("TypeId");

-- CreateIndex
CREATE INDEX "IX_ProductDefinitions_WorkflowId" ON "ProductDefinitions"("WorkflowId");

-- CreateIndex
CREATE INDEX "IX_ProductPublications_Package" ON "ProductPublications"("Package");

-- CreateIndex
CREATE INDEX "IX_ProductPublications_ProductBuildId" ON "ProductPublications"("ProductBuildId");

-- CreateIndex
CREATE INDEX "IX_ProductPublications_ProductId" ON "ProductPublications"("ProductId");

-- CreateIndex
CREATE INDEX "IX_ProductTransitions_ProductId" ON "ProductTransitions"("ProductId");

-- CreateIndex
CREATE INDEX "IX_Products_ProductDefinitionId" ON "Products"("ProductDefinitionId");

-- CreateIndex
CREATE INDEX "IX_Products_ProjectId" ON "Products"("ProjectId");

-- CreateIndex
CREATE INDEX "IX_Products_StoreId" ON "Products"("StoreId");

-- CreateIndex
CREATE INDEX "IX_Products_StoreLanguageId" ON "Products"("StoreLanguageId");

-- CreateIndex
CREATE INDEX "IX_ProjectImports_GroupId" ON "ProjectImports"("GroupId");

-- CreateIndex
CREATE INDEX "IX_ProjectImports_OrganizationId" ON "ProjectImports"("OrganizationId");

-- CreateIndex
CREATE INDEX "IX_ProjectImports_OwnerId" ON "ProjectImports"("OwnerId");

-- CreateIndex
CREATE INDEX "IX_ProjectImports_TypeId" ON "ProjectImports"("TypeId");

-- CreateIndex
CREATE INDEX "IX_Projects_GroupId" ON "Projects"("GroupId");

-- CreateIndex
CREATE INDEX "IX_Projects_ImportId" ON "Projects"("ImportId");

-- CreateIndex
CREATE INDEX "IX_Projects_OrganizationId" ON "Projects"("OrganizationId");

-- CreateIndex
CREATE INDEX "IX_Projects_OwnerId" ON "Projects"("OwnerId");

-- CreateIndex
CREATE INDEX "IX_Projects_TypeId" ON "Projects"("TypeId");

-- CreateIndex
CREATE INDEX "IX_Reviewers_ProjectId" ON "Reviewers"("ProjectId");

-- CreateIndex
CREATE INDEX "IX_StoreLanguages_StoreTypeId" ON "StoreLanguages"("StoreTypeId");

-- CreateIndex
CREATE INDEX "IX_Stores_StoreTypeId" ON "Stores"("StoreTypeId");

-- CreateIndex
CREATE INDEX "IX_UserRoles_OrganizationId" ON "UserRoles"("OrganizationId");

-- CreateIndex
CREATE INDEX "IX_UserRoles_RoleId" ON "UserRoles"("RoleId");

-- CreateIndex
CREATE INDEX "IX_UserRoles_UserId" ON "UserRoles"("UserId");

-- CreateIndex
CREATE INDEX "IX_UserTasks_ProductId" ON "UserTasks"("ProductId");

-- CreateIndex
CREATE INDEX "IX_UserTasks_UserId" ON "UserTasks"("UserId");

-- CreateIndex
CREATE INDEX "IX_Users_WorkflowUserId" ON "Users"("WorkflowUserId");

-- CreateIndex
CREATE INDEX "IX_WorkflowDefinitions_StoreTypeId" ON "WorkflowDefinitions"("StoreTypeId");

-- AddForeignKey
ALTER TABLE "Authors" ADD CONSTRAINT "FK_Authors_Projects_ProjectId" FOREIGN KEY ("ProjectId") REFERENCES "Projects"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Authors" ADD CONSTRAINT "FK_Authors_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GroupMemberships" ADD CONSTRAINT "FK_GroupMemberships_Groups_GroupId" FOREIGN KEY ("GroupId") REFERENCES "Groups"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GroupMemberships" ADD CONSTRAINT "FK_GroupMemberships_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "FK_Groups_Organizations_OwnerId" FOREIGN KEY ("OwnerId") REFERENCES "Organizations"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "FK_Notifications_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrganizationMembershipInvites" ADD CONSTRAINT "FK_OrganizationMembershipInvites_Organizations_OrganizationId" FOREIGN KEY ("OrganizationId") REFERENCES "Organizations"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrganizationMembershipInvites" ADD CONSTRAINT "FK_OrganizationMembershipInvites_Users_InvitedById" FOREIGN KEY ("InvitedById") REFERENCES "Users"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrganizationMemberships" ADD CONSTRAINT "FK_OrganizationMemberships_Organizations_OrganizationId" FOREIGN KEY ("OrganizationId") REFERENCES "Organizations"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrganizationMemberships" ADD CONSTRAINT "FK_OrganizationMemberships_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrganizationProductDefinitions" ADD CONSTRAINT "FK_OrganizationProductDefinitions_Organizations_OrganizationId" FOREIGN KEY ("OrganizationId") REFERENCES "Organizations"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrganizationProductDefinitions" ADD CONSTRAINT "FK_OrganizationProductDefinitions_ProductDefinitions_ProductDe~" FOREIGN KEY ("ProductDefinitionId") REFERENCES "ProductDefinitions"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrganizationStores" ADD CONSTRAINT "FK_OrganizationStores_Organizations_OrganizationId" FOREIGN KEY ("OrganizationId") REFERENCES "Organizations"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrganizationStores" ADD CONSTRAINT "FK_OrganizationStores_Stores_StoreId" FOREIGN KEY ("StoreId") REFERENCES "Stores"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Organizations" ADD CONSTRAINT "FK_Organizations_Users_OwnerId" FOREIGN KEY ("OwnerId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductArtifacts" ADD CONSTRAINT "FK_ProductArtifacts_ProductBuilds_ProductBuildId" FOREIGN KEY ("ProductBuildId") REFERENCES "ProductBuilds"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductArtifacts" ADD CONSTRAINT "FK_ProductArtifacts_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductBuilds" ADD CONSTRAINT "FK_ProductBuilds_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductDefinitions" ADD CONSTRAINT "FK_ProductDefinitions_ApplicationTypes_TypeId" FOREIGN KEY ("TypeId") REFERENCES "ApplicationTypes"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductDefinitions" ADD CONSTRAINT "FK_ProductDefinitions_WorkflowDefinitions_RebuildWorkflowId" FOREIGN KEY ("RebuildWorkflowId") REFERENCES "WorkflowDefinitions"("Id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductDefinitions" ADD CONSTRAINT "FK_ProductDefinitions_WorkflowDefinitions_RepublishWorkflowId" FOREIGN KEY ("RepublishWorkflowId") REFERENCES "WorkflowDefinitions"("Id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductDefinitions" ADD CONSTRAINT "FK_ProductDefinitions_WorkflowDefinitions_WorkflowId" FOREIGN KEY ("WorkflowId") REFERENCES "WorkflowDefinitions"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductPublications" ADD CONSTRAINT "FK_ProductPublications_ProductBuilds_ProductBuildId" FOREIGN KEY ("ProductBuildId") REFERENCES "ProductBuilds"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductPublications" ADD CONSTRAINT "FK_ProductPublications_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductTransitions" ADD CONSTRAINT "FK_ProductTransitions_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "FK_Products_ProductDefinitions_ProductDefinitionId" FOREIGN KEY ("ProductDefinitionId") REFERENCES "ProductDefinitions"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "FK_Products_Projects_ProjectId" FOREIGN KEY ("ProjectId") REFERENCES "Projects"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "FK_Products_StoreLanguages_StoreLanguageId" FOREIGN KEY ("StoreLanguageId") REFERENCES "StoreLanguages"("Id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "FK_Products_Stores_StoreId" FOREIGN KEY ("StoreId") REFERENCES "Stores"("Id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProjectImports" ADD CONSTRAINT "FK_ProjectImports_ApplicationTypes_TypeId" FOREIGN KEY ("TypeId") REFERENCES "ApplicationTypes"("Id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProjectImports" ADD CONSTRAINT "FK_ProjectImports_Groups_GroupId" FOREIGN KEY ("GroupId") REFERENCES "Groups"("Id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProjectImports" ADD CONSTRAINT "FK_ProjectImports_Organizations_OrganizationId" FOREIGN KEY ("OrganizationId") REFERENCES "Organizations"("Id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProjectImports" ADD CONSTRAINT "FK_ProjectImports_Users_OwnerId" FOREIGN KEY ("OwnerId") REFERENCES "Users"("Id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "FK_Projects_ApplicationTypes_TypeId" FOREIGN KEY ("TypeId") REFERENCES "ApplicationTypes"("Id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "FK_Projects_Groups_GroupId" FOREIGN KEY ("GroupId") REFERENCES "Groups"("Id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "FK_Projects_Organizations_OrganizationId" FOREIGN KEY ("OrganizationId") REFERENCES "Organizations"("Id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "FK_Projects_ProjectImports_ImportId" FOREIGN KEY ("ImportId") REFERENCES "ProjectImports"("Id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "FK_Projects_Users_OwnerId" FOREIGN KEY ("OwnerId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reviewers" ADD CONSTRAINT "FK_Reviewers_Projects_ProjectId" FOREIGN KEY ("ProjectId") REFERENCES "Projects"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "StoreLanguages" ADD CONSTRAINT "FK_StoreLanguages_StoreTypes_StoreTypeId" FOREIGN KEY ("StoreTypeId") REFERENCES "StoreTypes"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Stores" ADD CONSTRAINT "FK_Stores_StoreTypes_StoreTypeId" FOREIGN KEY ("StoreTypeId") REFERENCES "StoreTypes"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "FK_UserRoles_Organizations_OrganizationId" FOREIGN KEY ("OrganizationId") REFERENCES "Organizations"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "FK_UserRoles_Roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "Roles"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "FK_UserRoles_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTasks" ADD CONSTRAINT "FK_UserTasks_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTasks" ADD CONSTRAINT "FK_UserTasks_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "WorkflowDefinitions" ADD CONSTRAINT "FK_WorkflowDefinitions_StoreTypes_StoreTypeId" FOREIGN KEY ("StoreTypeId") REFERENCES "StoreTypes"("Id") ON DELETE RESTRICT ON UPDATE NO ACTION;

