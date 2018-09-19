using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class AddBuildEngineProperties : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PublishingKey",
                table: "Users",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WorkflowProjectId",
                table: "Projects",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateBuilt",
                table: "Products",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WorkflowBuildId",
                table: "Products",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WorkflowJobId",
                table: "Products",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WorkflowPublishId",
                table: "Products",
                nullable: false,
                defaultValue: 0);
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
                name: "WorkflowJobId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "WorkflowPublishId",
                table: "Products");
        }
    }
}
