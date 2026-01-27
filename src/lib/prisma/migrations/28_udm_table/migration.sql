/*
  Warnings:

  - Added the required column `ConfirmationCode` to the `ProductUserChanges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DateExpires` to the `ProductUserChanges` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ProductUserChanges" DROP CONSTRAINT "FK_ProductUserChanges_Products_ProductId";

-- AlterTable
ALTER TABLE "ProductUserChanges" ADD COLUMN     "ConfirmationCode" TEXT NOT NULL,
ADD COLUMN     "DateConfirmed" TIMESTAMP(6),
ADD COLUMN     "DateExpires" TIMESTAMP(6) NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductUserChanges" ADD CONSTRAINT "FK_ProductUserChanges_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;
