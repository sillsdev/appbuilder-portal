-- AlterTable
ALTER TABLE "WorkflowInstances" DROP COLUMN "Snapshot",
ADD COLUMN     "Context" TEXT NOT NULL,
ADD COLUMN     "State" TEXT NOT NULL,
ADD COLUMN     "WorkflowDefinitionId" INTEGER NOT NULL,
ADD COLUMN     "DateCreated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "DateUpdated" TIMESTAMP;

-- AddForeignKey
ALTER TABLE "WorkflowInstances" ADD CONSTRAINT "FK_WorkflowInstances_WorkflowDefinitions_WorkflowDefinitionId" FOREIGN KEY ("WorkflowDefinitionId") REFERENCES "WorkflowDefinitions"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- DropIndex
DROP INDEX "WorkflowInstances_ProductId_key";
