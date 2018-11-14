using Microsoft.EntityFrameworkCore.Migrations;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class ProductWorkflowComment : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Comment",
                table: "UserTasks",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "WorkflowProjectId",
                table: "Projects",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int));

            migrationBuilder.AddColumn<string>(
                name: "WorkflowComment",
                table: "Products",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Comment",
                table: "UserTasks");

            migrationBuilder.AlterColumn<int>(
                name: "WorkflowProjectId",
                table: "Projects",
                nullable: false,
                oldClrType: typeof(int),
                oldDefaultValue: 0);

            migrationBuilder.DropColumn(
                name: "WorkflowComment",
                table: "Products");
                
        }
    }
}
