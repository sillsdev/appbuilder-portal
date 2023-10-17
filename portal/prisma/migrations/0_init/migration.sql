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

-- CreateTable
CREATE TABLE "WorkflowGlobalParameter" (
    "Id" UUID NOT NULL,
    "Type" VARCHAR(512) NOT NULL,
    "Name" VARCHAR(256) NOT NULL,
    "Value" TEXT NOT NULL,

    CONSTRAINT "WorkflowGlobalParameter_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "WorkflowInbox" (
    "Id" UUID NOT NULL,
    "ProcessId" UUID NOT NULL,
    "IdentityId" VARCHAR(256) NOT NULL,

    CONSTRAINT "WorkflowInbox_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "WorkflowProcessInstance" (
    "Id" UUID NOT NULL,
    "StateName" VARCHAR(256),
    "ActivityName" VARCHAR(256) NOT NULL,
    "SchemeId" UUID NOT NULL,
    "PreviousState" VARCHAR(256),
    "PreviousStateForDirect" VARCHAR(256),
    "PreviousStateForReverse" VARCHAR(256),
    "PreviousActivity" VARCHAR(256),
    "PreviousActivityForDirect" VARCHAR(256),
    "PreviousActivityForReverse" VARCHAR(256),
    "IsDeterminingParametersChanged" BOOLEAN NOT NULL,
    "ParentProcessId" UUID,
    "RootProcessId" UUID NOT NULL,

    CONSTRAINT "WorkflowProcessInstance_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "WorkflowProcessInstancePersistence" (
    "Id" UUID NOT NULL,
    "ProcessId" UUID NOT NULL,
    "ParameterName" VARCHAR(256) NOT NULL,
    "Value" TEXT NOT NULL,

    CONSTRAINT "WorkflowProcessInstancePersistence_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "WorkflowProcessInstanceStatus" (
    "Id" UUID NOT NULL,
    "Status" SMALLINT NOT NULL,
    "Lock" UUID NOT NULL,

    CONSTRAINT "WorkflowProcessInstanceStatus_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "WorkflowProcessScheme" (
    "Id" UUID NOT NULL,
    "Scheme" TEXT NOT NULL,
    "DefiningParameters" TEXT NOT NULL,
    "DefiningParametersHash" VARCHAR(24) NOT NULL,
    "SchemeCode" VARCHAR(256) NOT NULL,
    "IsObsolete" BOOLEAN NOT NULL,
    "RootSchemeCode" VARCHAR(256),
    "RootSchemeId" UUID,
    "AllowedActivities" TEXT,
    "StartingTransition" TEXT,

    CONSTRAINT "WorkflowProcessScheme_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "WorkflowProcessTimer" (
    "Id" UUID NOT NULL,
    "ProcessId" UUID NOT NULL,
    "Name" VARCHAR(256) NOT NULL,
    "NextExecutionDateTime" TIMESTAMP(6) NOT NULL,
    "Ignore" BOOLEAN NOT NULL,

    CONSTRAINT "WorkflowProcessTimer_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "WorkflowProcessTransitionHistory" (
    "Id" UUID NOT NULL,
    "ProcessId" UUID NOT NULL,
    "ExecutorIdentityId" VARCHAR(256),
    "ActorIdentityId" VARCHAR(256),
    "FromActivityName" VARCHAR(256) NOT NULL,
    "ToActivityName" VARCHAR(256) NOT NULL,
    "ToStateName" VARCHAR(256),
    "TransitionTime" TIMESTAMP(6) NOT NULL,
    "TransitionClassifier" VARCHAR(256) NOT NULL,
    "FromStateName" VARCHAR(256),
    "TriggerName" VARCHAR(256),
    "IsFinalised" BOOLEAN NOT NULL,

    CONSTRAINT "WorkflowProcessTransitionHistory_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "WorkflowScheme" (
    "Code" VARCHAR(256) NOT NULL,
    "Scheme" TEXT NOT NULL,
    "CanBeInlined" BOOLEAN NOT NULL DEFAULT false,
    "InlinedSchemes" VARCHAR(1024),

    CONSTRAINT "WorkflowScheme_pkey" PRIMARY KEY ("Code")
);

-- CreateTable
CREATE TABLE "__EFMigrationsHistory" (
    "MigrationId" VARCHAR(150) NOT NULL,
    "ProductVersion" VARCHAR(32) NOT NULL,

    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

-- CreateTable
CREATE TABLE "dwAppSettings" (
    "Name" VARCHAR(50) NOT NULL,
    "Value" VARCHAR(1000) NOT NULL,
    "GroupName" VARCHAR(50),
    "ParamName" VARCHAR(1024) NOT NULL,
    "Order" INTEGER,
    "EditorType" VARCHAR(50) NOT NULL DEFAULT 0,
    "IsHidden" BOOLEAN NOT NULL DEFAULT (0)::boolean,

    CONSTRAINT "dwAppSettings_pkey" PRIMARY KEY ("Name")
);

-- CreateTable
CREATE TABLE "dwSecurityCredential" (
    "Id" UUID NOT NULL,
    "PasswordHash" VARCHAR(128),
    "PasswordSalt" VARCHAR(128),
    "SecurityUserId" UUID NOT NULL,
    "Login" VARCHAR(256) NOT NULL,
    "AuthenticationType" SMALLINT NOT NULL,

    CONSTRAINT "dwSecurityCredential_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "dwSecurityGroup" (
    "Id" UUID NOT NULL,
    "Name" VARCHAR(128) NOT NULL,
    "Comment" VARCHAR(1000),
    "IsSyncWithDomainGroup" BOOLEAN NOT NULL DEFAULT (0)::boolean,

    CONSTRAINT "dwSecurityGroup_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "dwSecurityGroupToSecurityRole" (
    "Id" UUID NOT NULL,
    "SecurityRoleId" UUID NOT NULL,
    "SecurityGroupId" UUID NOT NULL,

    CONSTRAINT "dwSecurityGroupToSecurityRole_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "dwSecurityGroupToSecurityUser" (
    "Id" UUID NOT NULL,
    "SecurityUserId" UUID NOT NULL,
    "SecurityGroupId" UUID NOT NULL,

    CONSTRAINT "dwSecurityGroupToSecurityUser_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "dwSecurityPermission" (
    "Id" UUID NOT NULL,
    "Code" VARCHAR(128) NOT NULL,
    "Name" VARCHAR(128),
    "GroupId" UUID NOT NULL,

    CONSTRAINT "dwSecurityPermission_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "dwSecurityPermissionGroup" (
    "Id" UUID NOT NULL,
    "Name" VARCHAR(128) NOT NULL,
    "Code" VARCHAR(128) NOT NULL,

    CONSTRAINT "dwSecurityPermissionGroup_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "dwSecurityRole" (
    "Id" UUID NOT NULL,
    "Code" VARCHAR(128) NOT NULL,
    "Name" VARCHAR(128) NOT NULL,
    "Comment" VARCHAR(1000),
    "DomainGroup" VARCHAR(512),

    CONSTRAINT "dwSecurityRole_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "dwSecurityRoleToSecurityPermission" (
    "Id" UUID NOT NULL,
    "SecurityRoleId" UUID NOT NULL,
    "SecurityPermissionId" UUID NOT NULL,
    "AccessType" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "dwSecurityRoleToSecurityPermission_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "dwSecurityUser" (
    "Id" UUID NOT NULL,
    "Name" VARCHAR(256) NOT NULL,
    "Email" VARCHAR(256),
    "IsLocked" BOOLEAN NOT NULL DEFAULT (0)::boolean,
    "ExternalId" VARCHAR(1024),
    "Timezone" VARCHAR(256),
    "Localization" VARCHAR(256),
    "DecimalSeparator" CHAR(1),
    "PageSize" INTEGER,
    "StartPage" VARCHAR(256),
    "IsRTL" BOOLEAN DEFAULT (0)::boolean,

    CONSTRAINT "dwSecurityUser_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "dwSecurityUserImpersonation" (
    "Id" UUID NOT NULL,
    "SecurityUserId" UUID NOT NULL,
    "ImpSecurityUserId" UUID NOT NULL,
    "DateFrom" TIMESTAMP(6) NOT NULL,
    "DateTo" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "dwSecurityUserImpersonation_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "dwSecurityUserState" (
    "Id" UUID NOT NULL,
    "SecurityUserId" UUID NOT NULL,
    "Key" VARCHAR(256) NOT NULL,
    "Value" TEXT NOT NULL,

    CONSTRAINT "dwSecurityUserState_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "dwSecurityUserToSecurityRole" (
    "Id" UUID NOT NULL,
    "SecurityRoleId" UUID NOT NULL,
    "SecurityUserId" UUID NOT NULL,

    CONSTRAINT "dwSecurityUserToSecurityRole_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "dwUploadedFiles" (
    "Id" UUID NOT NULL,
    "Data" BYTEA NOT NULL,
    "AttachmentLength" BIGINT NOT NULL,
    "Used" BOOLEAN NOT NULL DEFAULT (0)::boolean,
    "Name" VARCHAR(1000) NOT NULL,
    "ContentType" VARCHAR(255) NOT NULL,
    "CreatedBy" VARCHAR(1024),
    "CreatedDate" TIMESTAMP(6),
    "UpdatedBy" VARCHAR(1024),
    "UpdatedDate" TIMESTAMP(6),
    "Properties" TEXT,

    CONSTRAINT "dwUploadedFiles_pkey" PRIMARY KEY ("Id")
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

-- CreateIndex
CREATE INDEX "WorkflowGlobalParameter_Name_idx" ON "WorkflowGlobalParameter"("Name");

-- CreateIndex
CREATE INDEX "WorkflowGlobalParameter_Type_idx" ON "WorkflowGlobalParameter"("Type");

-- CreateIndex
CREATE INDEX "WorkflowInbox_IdentityId_idx" ON "WorkflowInbox"("IdentityId");

-- CreateIndex
CREATE INDEX "WorkflowInbox_ProcessId_idx" ON "WorkflowInbox"("ProcessId");

-- CreateIndex
CREATE INDEX "WorkflowProcessInstancePersistence_ProcessId_idx" ON "WorkflowProcessInstancePersistence"("ProcessId");

-- CreateIndex
CREATE INDEX "WorkflowProcessInstanceStatus_Status_idx" ON "WorkflowProcessInstanceStatus"("Status");

-- CreateIndex
CREATE INDEX "WorkflowProcessScheme_DefiningParametersHash_idx" ON "WorkflowProcessScheme"("DefiningParametersHash");

-- CreateIndex
CREATE INDEX "WorkflowProcessScheme_IsObsolete_idx" ON "WorkflowProcessScheme"("IsObsolete");

-- CreateIndex
CREATE INDEX "WorkflowProcessScheme_SchemeCode_idx" ON "WorkflowProcessScheme"("SchemeCode");

-- CreateIndex
CREATE INDEX "WorkflowProcessTimer_Ignore_idx" ON "WorkflowProcessTimer"("Ignore");

-- CreateIndex
CREATE INDEX "WorkflowProcessTimer_Name_idx" ON "WorkflowProcessTimer"("Name");

-- CreateIndex
CREATE INDEX "WorkflowProcessTimer_NextExecutionDateTime_idx" ON "WorkflowProcessTimer"("NextExecutionDateTime");

-- CreateIndex
CREATE INDEX "WorkflowProcessTimer_ProcessId_idx" ON "WorkflowProcessTimer"("ProcessId");

-- CreateIndex
CREATE INDEX "WorkflowProcessTransitionHistory_ActorIdentityId_idx" ON "WorkflowProcessTransitionHistory"("ActorIdentityId");

-- CreateIndex
CREATE INDEX "WorkflowProcessTransitionHistory_ExecutorIdentityId_idx" ON "WorkflowProcessTransitionHistory"("ExecutorIdentityId");

-- CreateIndex
CREATE INDEX "WorkflowProcessTransitionHistory_ProcessId_idx" ON "WorkflowProcessTransitionHistory"("ProcessId");

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

-- AddForeignKey
ALTER TABLE "dwSecurityCredential" ADD CONSTRAINT "dwSecurityCredential_SecurityUserId_fkey" FOREIGN KEY ("SecurityUserId") REFERENCES "dwSecurityUser"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dwSecurityGroupToSecurityRole" ADD CONSTRAINT "dwSecurityGroupToSecurityRole_SecurityGroupId_fkey" FOREIGN KEY ("SecurityGroupId") REFERENCES "dwSecurityGroup"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dwSecurityGroupToSecurityRole" ADD CONSTRAINT "dwSecurityGroupToSecurityRole_SecurityRoleId_fkey" FOREIGN KEY ("SecurityRoleId") REFERENCES "dwSecurityRole"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dwSecurityGroupToSecurityUser" ADD CONSTRAINT "dwSecurityGroupToSecurityUser_SecurityGroupId_fkey" FOREIGN KEY ("SecurityGroupId") REFERENCES "dwSecurityGroup"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dwSecurityGroupToSecurityUser" ADD CONSTRAINT "dwSecurityGroupToSecurityUser_SecurityUserId_fkey" FOREIGN KEY ("SecurityUserId") REFERENCES "dwSecurityUser"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dwSecurityPermission" ADD CONSTRAINT "dwSecurityPermission_GroupId_fkey" FOREIGN KEY ("GroupId") REFERENCES "dwSecurityPermissionGroup"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dwSecurityRoleToSecurityPermission" ADD CONSTRAINT "dwSecurityRoleToSecurityPermission_SecurityPermissionId_fkey" FOREIGN KEY ("SecurityPermissionId") REFERENCES "dwSecurityPermission"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dwSecurityRoleToSecurityPermission" ADD CONSTRAINT "dwSecurityRoleToSecurityPermission_SecurityRoleId_fkey" FOREIGN KEY ("SecurityRoleId") REFERENCES "dwSecurityRole"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dwSecurityUserImpersonation" ADD CONSTRAINT "dwSecurityUserImpersonation_ImpSecurityUserId_fkey" FOREIGN KEY ("ImpSecurityUserId") REFERENCES "dwSecurityUser"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dwSecurityUserImpersonation" ADD CONSTRAINT "dwSecurityUserImpersonation_SecurityUserId_fkey" FOREIGN KEY ("SecurityUserId") REFERENCES "dwSecurityUser"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dwSecurityUserState" ADD CONSTRAINT "dwSecurityUserState_SecurityUserId_fkey" FOREIGN KEY ("SecurityUserId") REFERENCES "dwSecurityUser"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dwSecurityUserToSecurityRole" ADD CONSTRAINT "dwSecurityUserToSecurityRole_SecurityRoleId_fkey" FOREIGN KEY ("SecurityRoleId") REFERENCES "dwSecurityRole"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dwSecurityUserToSecurityRole" ADD CONSTRAINT "dwSecurityUserToSecurityRole_SecurityUserId_fkey" FOREIGN KEY ("SecurityUserId") REFERENCES "dwSecurityUser"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

