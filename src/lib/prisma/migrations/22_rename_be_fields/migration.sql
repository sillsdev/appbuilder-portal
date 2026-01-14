/*
  Warnings:

  - You are about to drop the column `WorkflowAppProjectUrl` on the `Projects` table. All the data in the column will be lost.
*/
-- AlterTable
ALTER TABLE "Products" RENAME COLUMN "WorkflowBuildId" TO "BuildEngineBuildId";
ALTER TABLE "Products" RENAME COLUMN "WorkflowJobId" TO "BuildEngineJobId";
ALTER TABLE "Products" RENAME COLUMN "WorkflowPublishId" TO "BuildEngineReleaseId";

-- AlterTable
ALTER TABLE "Projects" DROP COLUMN "WorkflowAppProjectUrl";
ALTER TABLE "Projects" RENAME COLUMN "WorkflowProjectId" TO "BuildEngineProjectId";
ALTER TABLE "Projects" RENAME COLUMN "WorkflowProjectUrl" TO "RepositoryUrl";

-- AlterTable
ALTER TABLE "ProductBuilds" RENAME COLUMN "BuildId" to "BuildEngineBuildId";

-- AlterTable
ALTER TABLE "ProductPublications" RENAME COLUMN "ReleaseId" to "BuildEngineReleaseId";
