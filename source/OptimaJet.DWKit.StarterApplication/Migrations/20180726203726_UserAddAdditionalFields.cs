using Microsoft.EntityFrameworkCore.Migrations;

namespace Optimajet.DWKit.StarterApplication.Migrations
{
    public partial class UserAddAdditionalFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                table: "User",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Locale",
                table: "User",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "User",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Timezone",
                table: "User",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsLocked",
                table: "User");

            migrationBuilder.DropColumn(
                name: "Locale",
                table: "User");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "User");

            migrationBuilder.DropColumn(
                name: "Timezone",
                table: "User");
        }
    }
}
