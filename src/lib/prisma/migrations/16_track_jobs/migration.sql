-- CreateTable
CREATE TABLE "QueueRecords" (
    "Id" SERIAL NOT NULL,
    "ProductTransitionId" INTEGER NOT NULL,
    "Queue" TEXT NOT NULL,
    "JobType" TEXT NOT NULL,
    "JobId" TEXT NOT NULL,

    CONSTRAINT "PK_QueueRecords" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE INDEX "IX_QueueRecords_ProductTransitionId" ON "QueueRecords"("ProductTransitionId");

-- AddForeignKey
ALTER TABLE "QueueRecords" ADD CONSTRAINT "FK_QueueRecords_ProductTransitions_ProductTransitionId" FOREIGN KEY ("ProductTransitionId") REFERENCES "ProductTransitions"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;
