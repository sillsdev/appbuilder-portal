using Microsoft.EntityFrameworkCore.Migrations;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class ProjectRenameIsPublic : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Private",
                table: "Projects");

            migrationBuilder.AddColumn<bool>(
                name: "IsPublic",
                table: "Projects",
                nullable: false,
                defaultValue: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPublic",
                table: "Projects");

            migrationBuilder.AddColumn<bool>(
                name: "Private",
                table: "Projects",
                nullable: false,
                defaultValue: false);
        }
    }
}
