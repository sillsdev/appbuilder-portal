-- CreateTable
CREATE TABLE "AdminSettings" (
    "Key" TEXT NOT NULL,
    "Value" TEXT,
    "DateCreated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "DateUpdated" TIMESTAMP,
    "ModifiedById" INTEGER,

    CONSTRAINT "PK_AdminSettings" PRIMARY KEY ("Key")
);

-- AddForeignKey
ALTER TABLE "AdminSettings" ADD CONSTRAINT "AdminSettings_ModifiedById_fkey" FOREIGN KEY ("ModifiedById") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE NO ACTION;
