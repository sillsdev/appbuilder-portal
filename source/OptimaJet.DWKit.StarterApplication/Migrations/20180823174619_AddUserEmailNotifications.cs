using Microsoft.EntityFrameworkCore.Migrations;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class AddUserEmailNotifications : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EmailNotification",
                table: "Users",
                nullable: false,
                defaultValue: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailNotification",
                table: "Users");
        }
    }
}
