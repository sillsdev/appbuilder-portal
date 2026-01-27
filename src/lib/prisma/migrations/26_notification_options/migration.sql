-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "EmailNotification" SET NOT NULL;
ALTER TABLE "Users" ADD COLUMN     "NotificationOptions" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
