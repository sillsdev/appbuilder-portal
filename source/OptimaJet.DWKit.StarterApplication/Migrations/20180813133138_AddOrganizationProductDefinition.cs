using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Optimajet.DWKit.StarterApplication.Migrations
{
    public partial class AddOrganizationProductDefinition : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrganizationProductDefinitions",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    OrganizationId = table.Column<int>(nullable: false),
                    ProductDefinitionId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationProductDefinitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationProductDefinitions_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrganizationProductDefinitions_ProductDefinitions_ProductDe~",
                        column: x => x.ProductDefinitionId,
                        principalTable: "ProductDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationProductDefinitions_OrganizationId",
                table: "OrganizationProductDefinitions",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationProductDefinitions_ProductDefinitionId",
                table: "OrganizationProductDefinitions",
                column: "ProductDefinitionId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrganizationProductDefinitions");
        }
    }
}
