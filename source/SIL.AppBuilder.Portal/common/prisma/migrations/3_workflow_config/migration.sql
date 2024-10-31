-- AlterTable
ALTER TABLE "WorkflowDefinitions" ADD COLUMN     "AdminRequirements" INTEGER[] DEFAULT ARRAY[0]::INTEGER[],
ADD COLUMN     "ProductType" INTEGER NOT NULL DEFAULT 0;
