using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Optimajet.DWKit.StarterApplication.Migrations
{
    public partial class AddOrganizationMembership : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OwnerId",
                table: "Organization",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "OrganizationMembership",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    UserId = table.Column<int>(nullable: false),
                    OrganizationId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationMembership", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationMembership_Organization_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organization",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrganizationMembership_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Organization_OwnerId",
                table: "Organization",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationMembership_OrganizationId",
                table: "OrganizationMembership",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationMembership_UserId",
                table: "OrganizationMembership",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Organization_User_OwnerId",
                table: "Organization",
                column: "OwnerId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Organization_User_OwnerId",
                table: "Organization");

            migrationBuilder.DropTable(
                name: "OrganizationMembership");

            migrationBuilder.DropIndex(
                name: "IX_Organization_OwnerId",
                table: "Organization");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Organization");
        }
    }
}
