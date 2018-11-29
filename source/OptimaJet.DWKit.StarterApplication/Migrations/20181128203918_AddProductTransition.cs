using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class AddProductTransition : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductTransitions",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ProductId = table.Column<Guid>(nullable: false),
                    WorkflowUserId = table.Column<Guid>(nullable: true),
                    AllowedUserNames = table.Column<string>(nullable: true),
                    InitialState = table.Column<string>(nullable: true),
                    DestinationState = table.Column<string>(nullable: true),
                    Command = table.Column<string>(nullable: true),
                    DateTransition = table.Column<DateTime>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductTransitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductTransitions_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductTransitions_ProductId",
                table: "ProductTransitions",
                column: "ProductId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductTransitions");
        }
    }
}
