-- CreateTable
CREATE TABLE "SupportData" (
    "Id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "TicketUrl" TEXT,
    "AgentId" INTEGER NOT NULL,
    "DateUploaded" TIMESTAMP(6),

    CONSTRAINT "PK_SupportData" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE INDEX "IX_SupportData_AgentId" ON "SupportData"("AgentId");

-- AddForeignKey
ALTER TABLE "SupportData" ADD CONSTRAINT "FK_SupportData_Users_AgentId" FOREIGN KEY ("AgentId") REFERENCES "Users"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;