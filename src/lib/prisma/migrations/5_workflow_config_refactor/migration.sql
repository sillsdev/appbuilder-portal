-- AlterTable
ALTER TABLE "WorkflowDefinitions" DROP COLUMN "AdminRequirements",
ADD COLUMN     "WorkflowOptions" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
