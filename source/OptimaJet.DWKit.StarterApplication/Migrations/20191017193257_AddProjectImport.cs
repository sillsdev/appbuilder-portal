using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class AddProjectImport : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ImportId",
                table: "Projects",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProjectImports",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ImportData = table.Column<string>(nullable: true),
                    TypeId = table.Column<int>(nullable: true),
                    OwnerId = table.Column<int>(nullable: true),
                    GroupId = table.Column<int>(nullable: true),
                    OrganizationId = table.Column<int>(nullable: true),
                    DateCreated = table.Column<DateTime>(nullable: true),
                    DateUpdated = table.Column<DateTime>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectImports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectImports_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProjectImports_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProjectImports_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProjectImports_ApplicationTypes_TypeId",
                        column: x => x.TypeId,
                        principalTable: "ApplicationTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ImportId",
                table: "Projects",
                column: "ImportId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectImports_GroupId",
                table: "ProjectImports",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectImports_OrganizationId",
                table: "ProjectImports",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectImports_OwnerId",
                table: "ProjectImports",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectImports_TypeId",
                table: "ProjectImports",
                column: "TypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_ProjectImports_ImportId",
                table: "Projects",
                column: "ImportId",
                principalTable: "ProjectImports",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_ProjectImports_ImportId",
                table: "Projects");

            migrationBuilder.DropTable(
                name: "ProjectImports");

            migrationBuilder.DropIndex(
                name: "IX_Projects_ImportId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ImportId",
                table: "Projects");
        }
    }
}
