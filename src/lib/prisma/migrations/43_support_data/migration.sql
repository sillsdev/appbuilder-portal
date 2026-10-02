-- CreateTable
CREATE TABLE "SupportData" (
    "Id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "TicketId" TEXT,
    "CreatedById" INTEGER NOT NULL,
    "DateUploaded" TIMESTAMP(6),

    CONSTRAINT "PK_SupportData" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE INDEX "IX_SupportData_CreatedById" ON "SupportData"("CreatedById");

-- AddForeignKey
ALTER TABLE "SupportData" ADD CONSTRAINT "FK_SupportData_Users_CreatedById" FOREIGN KEY ("CreatedById") REFERENCES "Users"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;