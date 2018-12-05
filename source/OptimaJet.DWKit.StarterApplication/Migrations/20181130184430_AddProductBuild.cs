using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class AddProductBuild : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProductBuildId",
                table: "ProductArtifacts",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ProductBuilds",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ProductId = table.Column<Guid>(nullable: false),
                    BuildId = table.Column<int>(nullable: false),
                    Version = table.Column<string>(nullable: true),
                    DateCreated = table.Column<DateTime>(nullable: true),
                    DateUpdated = table.Column<DateTime>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductBuilds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductBuilds_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductArtifacts_ProductBuildId",
                table: "ProductArtifacts",
                column: "ProductBuildId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductBuilds_ProductId",
                table: "ProductBuilds",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductArtifacts_ProductBuilds_ProductBuildId",
                table: "ProductArtifacts",
                column: "ProductBuildId",
                principalTable: "ProductBuilds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductArtifacts_ProductBuilds_ProductBuildId",
                table: "ProductArtifacts");

            migrationBuilder.DropTable(
                name: "ProductBuilds");

            migrationBuilder.DropIndex(
                name: "IX_ProductArtifacts_ProductBuildId",
                table: "ProductArtifacts");

            migrationBuilder.DropColumn(
                name: "ProductBuildId",
                table: "ProductArtifacts");
        }
    }
}
