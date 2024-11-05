-- AlterTable
ALTER TABLE "WorkflowDefinitions" DROP COLUMN "AdminRequirements",
ADD COLUMN     "WorkflowOptions" INTEGER[] DEFAULT ARRAY[0]::INTEGER[];
