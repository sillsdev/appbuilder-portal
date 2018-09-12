using Microsoft.EntityFrameworkCore.Migrations;

namespace Optimajet.DWKit.StarterApplication.Migrations
{
    public partial class AddPublicByDefaultToOrganization : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "UseSilBuildInfrastructure",
                table: "Organizations",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool));

            migrationBuilder.AddColumn<bool>(
                name: "PublicByDefault",
                table: "Organizations",
                nullable: false,
                defaultValue: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublicByDefault",
                table: "Organizations");

            migrationBuilder.AlterColumn<bool>(
                name: "UseSilBuildInfrastructure",
                table: "Organizations",
                nullable: false,
                oldClrType: typeof(bool),
                oldDefaultValue: true);
        }
    }
}
