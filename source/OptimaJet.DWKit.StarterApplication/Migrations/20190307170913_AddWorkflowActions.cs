using Microsoft.EntityFrameworkCore.Migrations;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class AddWorkflowActions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "WorkflowDefinitions",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "RebuildWorkflowId",
                table: "ProductDefinitions",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RepublishWorkflowId",
                table: "ProductDefinitions",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductDefinitions_RebuildWorkflowId",
                table: "ProductDefinitions",
                column: "RebuildWorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductDefinitions_RepublishWorkflowId",
                table: "ProductDefinitions",
                column: "RepublishWorkflowId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductDefinitions_WorkflowDefinitions_RebuildWorkflowId",
                table: "ProductDefinitions",
                column: "RebuildWorkflowId",
                principalTable: "WorkflowDefinitions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductDefinitions_WorkflowDefinitions_RepublishWorkflowId",
                table: "ProductDefinitions",
                column: "RepublishWorkflowId",
                principalTable: "WorkflowDefinitions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductDefinitions_WorkflowDefinitions_RebuildWorkflowId",
                table: "ProductDefinitions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductDefinitions_WorkflowDefinitions_RepublishWorkflowId",
                table: "ProductDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_ProductDefinitions_RebuildWorkflowId",
                table: "ProductDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_ProductDefinitions_RepublishWorkflowId",
                table: "ProductDefinitions");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "WorkflowDefinitions");

            migrationBuilder.DropColumn(
                name: "RebuildWorkflowId",
                table: "ProductDefinitions");

            migrationBuilder.DropColumn(
                name: "RepublishWorkflowId",
                table: "ProductDefinitions");
        }
    }
}
