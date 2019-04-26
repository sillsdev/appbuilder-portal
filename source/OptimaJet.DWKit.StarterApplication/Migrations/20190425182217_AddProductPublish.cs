using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class AddProductPublish : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Success",
                table: "ProductBuilds",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProductPublishes",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ProductBuildId = table.Column<int>(nullable: false),
                    ReleaseId = table.Column<int>(nullable: false),
                    Channel = table.Column<string>(nullable: true),
                    LogUrl = table.Column<string>(nullable: true),
                    Success = table.Column<bool>(nullable: true),
                    DateCreated = table.Column<DateTime>(nullable: true),
                    DateUpdated = table.Column<DateTime>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductPublishes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductPublishes_ProductBuilds_ProductBuildId",
                        column: x => x.ProductBuildId,
                        principalTable: "ProductBuilds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductPublishes_ProductBuildId",
                table: "ProductPublishes",
                column: "ProductBuildId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductPublishes");

            migrationBuilder.DropColumn(
                name: "Success",
                table: "ProductBuilds");
        }
    }
}
