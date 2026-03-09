-- AlterTable
ALTER TABLE "ProductBuilds" ADD COLUMN     "TransitionId" INTEGER;

-- AlterTable
ALTER TABLE "ProductPublications" ADD COLUMN     "TransitionId" INTEGER;

-- CreateIndex
CREATE INDEX "IX_ProductBuilds_TransitionId" ON "ProductBuilds"("TransitionId");

-- CreateIndex
CREATE INDEX "IX_ProductPublications_TransitionId" ON "ProductPublications"("TransitionId");

-- AddForeignKey
ALTER TABLE "ProductBuilds" ADD CONSTRAINT "FK_ProductBuilds_ProductTransitions_TransitionId" FOREIGN KEY ("TransitionId") REFERENCES "ProductTransitions"("Id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductPublications" ADD CONSTRAINT "FK_ProductPublications_ProductTransitions_TransitionId" FOREIGN KEY ("TransitionId") REFERENCES "ProductTransitions"("Id") ON DELETE SET NULL ON UPDATE NO ACTION;
