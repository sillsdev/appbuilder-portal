using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Optimajet.DWKit.StarterApplication.Migrations
{
    public partial class AddBuildEngineProperties : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PublishingKey",
                table: "Users",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkflowProjectId",
                table: "Projects",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateBuilt",
                table: "Products",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkflowBuildId",
                table: "Products",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkflowPublishId",
                table: "Products",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublishingKey",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WorkflowProjectId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "DateBuilt",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "WorkflowBuildId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "WorkflowPublishId",
                table: "Products");
        }
    }
}
