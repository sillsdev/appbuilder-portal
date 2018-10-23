using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class WorkflowAndUserMgmt : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_Role_RoleName",
                table: "UserRoles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Role",
                table: "Role");

            migrationBuilder.RenameTable(
                name: "Role",
                newName: "Roles");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateCreated",
                table: "Users",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateUpdated",
                table: "Users",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WorkflowUserId",
                table: "Users",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WorkflowProcessId",
                table: "Products",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Roles",
                table: "Roles",
                column: "RoleName");

            migrationBuilder.CreateIndex(
                name: "IX_Users_WorkflowUserId",
                table: "Users",
                column: "WorkflowUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_Roles_RoleName",
                table: "UserRoles",
                column: "RoleName",
                principalTable: "Roles",
                principalColumn: "RoleName",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_Roles_RoleName",
                table: "UserRoles");

            migrationBuilder.DropIndex(
                name: "IX_Users_WorkflowUserId",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Roles",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "DateCreated",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DateUpdated",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WorkflowUserId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WorkflowProcessId",
                table: "Products");

            migrationBuilder.RenameTable(
                name: "Roles",
                newName: "Role");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Role",
                table: "Role",
                column: "RoleName");

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_Role_RoleName",
                table: "UserRoles",
                column: "RoleName",
                principalTable: "Role",
                principalColumn: "RoleName",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
