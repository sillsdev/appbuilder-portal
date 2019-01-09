using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class AddOrganizationMembershipInvites : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrganizationMembershipInvites",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Token = table.Column<Guid>(nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    Email = table.Column<string>(nullable: false),
                    Expires = table.Column<DateTime>(nullable: false, defaultValueSql: "current_date + 7"),
                    Redeemed = table.Column<bool>(nullable: false, defaultValue: false),
                    InvitedById = table.Column<int>(nullable: false),
                    OrganizationId = table.Column<int>(nullable: false),
                    DateCreated = table.Column<DateTime>(nullable: true),
                    DateUpdated = table.Column<DateTime>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationMembershipInvites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationMembershipInvites_Users_InvitedById",
                        column: x => x.InvitedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_OrganizationMembershipInvites_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationMembershipInvites_InvitedById",
                table: "OrganizationMembershipInvites",
                column: "InvitedById");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationMembershipInvites_OrganizationId",
                table: "OrganizationMembershipInvites",
                column: "OrganizationId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrganizationMembershipInvites");
        }
    }
}
