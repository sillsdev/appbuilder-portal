using Microsoft.EntityFrameworkCore.Migrations;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class AddSubsToNotification : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "SendEmail",
                table: "Notifications",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool));

            migrationBuilder.AddColumn<string>(
                name: "MessageId",
                table: "Notifications",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MessageSubstitutionsJson",
                table: "Notifications",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MessageId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "MessageSubstitutionsJson",
                table: "Notifications");

            migrationBuilder.AlterColumn<bool>(
                name: "SendEmail",
                table: "Notifications",
                nullable: false,
                oldClrType: typeof(bool),
                oldDefaultValue: true);
        }
    }
}
