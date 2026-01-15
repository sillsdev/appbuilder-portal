-- CreateTable
CREATE TABLE "QueueRecords" (
    "ProductTransitionId" INTEGER NOT NULL,
    "Queue" TEXT NOT NULL,
    "JobType" TEXT NOT NULL,
    "JobId" TEXT NOT NULL,

    CONSTRAINT "IX_QueueRecords_Queue_JobId" PRIMARY KEY ("Queue", "JobId")
);

-- CreateIndex
CREATE INDEX "IX_QueueRecords_ProductTransitionId" ON "QueueRecords"("ProductTransitionId");

-- AddForeignKey
ALTER TABLE "QueueRecords" ADD CONSTRAINT "FK_QueueRecords_ProductTransitions_ProductTransitionId" FOREIGN KEY ("ProductTransitionId") REFERENCES "ProductTransitions"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;
