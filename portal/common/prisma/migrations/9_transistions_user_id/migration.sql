-- AlterTable
ALTER TABLE "ProductTransitions" ADD COLUMN     "UserId" INTEGER;

-- AddForeignKey
ALTER TABLE "ProductTransitions" ADD CONSTRAINT "ProductTransitions_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
