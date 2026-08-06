-- AlterTable
ALTER TABLE "ProductUserChanges" ADD COLUMN     "AssignedRole" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "CompletedById" INTEGER;

-- AddForeignKey
ALTER TABLE "ProductUserChanges" ADD CONSTRAINT "FK_ProductUserChanges_Users_CompletedById" FOREIGN KEY ("CompletedById") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;
