using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class ChangePublishesToPublications : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductPublishes");

            migrationBuilder.CreateTable(
                name: "ProductPublications",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ProductId = table.Column<Guid>(nullable: false),
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
                    table.PrimaryKey("PK_ProductPublications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductPublications_ProductBuilds_ProductBuildId",
                        column: x => x.ProductBuildId,
                        principalTable: "ProductBuilds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductPublications_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductPublications_ProductBuildId",
                table: "ProductPublications",
                column: "ProductBuildId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductPublications_ProductId",
                table: "ProductPublications",
                column: "ProductId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductPublications");

            migrationBuilder.CreateTable(
                name: "ProductPublishes",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Channel = table.Column<string>(nullable: true),
                    DateCreated = table.Column<DateTime>(nullable: true),
                    DateUpdated = table.Column<DateTime>(nullable: true),
                    LogUrl = table.Column<string>(nullable: true),
                    ProductBuildId = table.Column<int>(nullable: false),
                    ProductId = table.Column<Guid>(nullable: false),
                    ReleaseId = table.Column<int>(nullable: false),
                    Success = table.Column<bool>(nullable: true)
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
                    table.ForeignKey(
                        name: "FK_ProductPublishes_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductPublishes_ProductBuildId",
                table: "ProductPublishes",
                column: "ProductBuildId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductPublishes_ProductId",
                table: "ProductPublishes",
                column: "ProductId");
        }
    }
}
