-- CreateTable
CREATE TABLE "APITokens" (
    "Id" SERIAL NOT NULL,
    "Token" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "Expires" TIMESTAMP(6) NOT NULL DEFAULT (CURRENT_DATE + 7),
    "UserId" INTEGER NOT NULL,

    CONSTRAINT "PK_APITokens" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE INDEX "IX_APITokens_UserId" ON "APITokens"("UserId");

-- AddForeignKey
ALTER TABLE "APITokens" ADD CONSTRAINT "FK_APITokens_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;
