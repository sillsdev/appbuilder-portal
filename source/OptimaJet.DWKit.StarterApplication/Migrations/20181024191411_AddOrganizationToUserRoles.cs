using Microsoft.EntityFrameworkCore.Migrations;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class AddOrganizationToUserRoles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OrganizationId",
                table: "UserRoles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_OrganizationId",
                table: "UserRoles",
                column: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_Organizations_OrganizationId",
                table: "UserRoles",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_Organizations_OrganizationId",
                table: "UserRoles");

            migrationBuilder.DropIndex(
                name: "IX_UserRoles_OrganizationId",
                table: "UserRoles");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "UserRoles");
        }
    }
}
