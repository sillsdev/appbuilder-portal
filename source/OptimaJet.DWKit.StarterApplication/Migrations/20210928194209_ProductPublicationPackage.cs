using Microsoft.EntityFrameworkCore.Migrations;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class ProductPublicationPackage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Package",
                table: "ProductPublications",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductPublications_Package",
                table: "ProductPublications",
                column: "Package");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductPublications_Package",
                table: "ProductPublications");

            migrationBuilder.DropColumn(
                name: "Package",
                table: "ProductPublications");
        }
    }
}
