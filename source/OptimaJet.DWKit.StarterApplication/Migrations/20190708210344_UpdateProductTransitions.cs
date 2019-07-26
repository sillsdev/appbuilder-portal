using Microsoft.EntityFrameworkCore.Migrations;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class UpdateProductTransitions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TransitionType",
                table: "ProductTransitions",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "WorkflowType",
                table: "ProductTransitions",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TransitionType",
                table: "ProductTransitions");

            migrationBuilder.DropColumn(
                name: "WorkflowType",
                table: "ProductTransitions");
        }
    }
}
