using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Optimajet.DWKit.StarterApplication.Migrations
{
    public partial class DateTime_Visibility : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Created",
                table: "OrganizationInviteRequests");

            migrationBuilder.AddColumn<int>(
                name: "ProfileVisibility",
                table: "Users",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateUpdated",
                table: "Projects",
                nullable: true,
                oldClrType: typeof(DateTime));

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateCreated",
                table: "Projects",
                nullable: true,
                oldClrType: typeof(DateTime));

            migrationBuilder.AddColumn<DateTime>(
                name: "DataArchived",
                table: "Projects",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateCreated",
                table: "OrganizationInviteRequests",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateUpdated",
                table: "OrganizationInviteRequests",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfileVisibility",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DataArchived",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "DateCreated",
                table: "OrganizationInviteRequests");

            migrationBuilder.DropColumn(
                name: "DateUpdated",
                table: "OrganizationInviteRequests");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateUpdated",
                table: "Projects",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateCreated",
                table: "Projects",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Created",
                table: "OrganizationInviteRequests",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
