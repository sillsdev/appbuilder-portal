using Microsoft.EntityFrameworkCore.Migrations;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class changeNotifications : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MessageId",
                table: "Notifications");

            migrationBuilder.RenameColumn(
                name: "MessageSubstitutionsJson",
                table: "Notifications",
                newName: "Message");

            migrationBuilder.AddColumn<bool>(
                name: "SendEmail",
                table: "Notifications",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SendEmail",
                table: "Notifications");

            migrationBuilder.RenameColumn(
                name: "Message",
                table: "Notifications",
                newName: "MessageSubstitutionsJson");

            migrationBuilder.AddColumn<string>(
                name: "MessageId",
                table: "Notifications",
                nullable: true);
        }
    }
}
