using Microsoft.EntityFrameworkCore.Migrations;

namespace Optimajet.DWKit.StarterApplication.Migrations
{
    public partial class AddProjectProperties : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AllowDownloads",
                table: "Projects",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "AutomaticBuilds",
                table: "Projects",
                nullable: false,
                defaultValue: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowDownloads",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "AutomaticBuilds",
                table: "Projects");
        }
    }
}
