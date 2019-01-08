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
                    Token = table.Column<Guid>(
                        nullable: false,
                        defaultValueSql: "uuid_generate_v4()"),

                    Email = table.Column<string>(nullable: false),
                    Expires = table.Column<DateTime>(nullable: false),
                    InvitedById = table.Column<int>(nullable: false),
                    OrganizationId = table.Column<int>(nullable: false),
                    DateCreated = table.Column<DateTime>(nullable: true),
                    DateUpdated = table.Column<DateTime>(nullable: true),
                    OrganizationMembershipId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationMembershipInvites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationMembershipInvites_Users_InvitedById",
                        column: x => x.InvitedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrganizationMembershipInvites_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrganizationMembershipInvites_OrganizationMemberships_OrganizationMembershipId",
                        column: x => x.OrganizationMembershipId,
                        principalTable: "OrganizationMemberships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationMembershipInvites_InvitedById",
                table: "OrganizationMembershipInvites",
                column: "InvitedById");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationMembershipInvites_OrganizationId",
                table: "OrganizationMembershipInvites",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationMembershipInvites_OrganizationMembershipId",
                table: "OrganizationMembershipInvites",
                column: "OrganizationMembershipId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrganizationMembershipInvites");
        }
    }
}
