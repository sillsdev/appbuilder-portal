-- AlterTable
ALTER TABLE "Groups" ALTER COLUMN "Abbreviation" DROP NOT NULL;
ALTER TABLE "Groups" RENAME COLUMN "Abbreviation" TO "Description";
