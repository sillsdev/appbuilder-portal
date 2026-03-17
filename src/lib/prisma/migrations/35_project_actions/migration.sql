-- CreateTable
CREATE TABLE "ProjectActions" (
    "Id" SERIAL NOT NULL,
    "ProjectId" INTEGER NOT NULL,
    "UserId" INTEGER NOT NULL,
    "DateAction" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ActionType" INTEGER NOT NULL,
    "Action" TEXT NOT NULL,
    "Value" TEXT,
    "ExternalId" INTEGER,

    CONSTRAINT "PK_ProjectActions" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "ProjectActions" ADD CONSTRAINT "FK_ProjectActions_Projects_ProjectId" FOREIGN KEY ("ProjectId") REFERENCES "Projects"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProjectActions" ADD CONSTRAINT "FK_ProjectActions_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE NO ACTION;
