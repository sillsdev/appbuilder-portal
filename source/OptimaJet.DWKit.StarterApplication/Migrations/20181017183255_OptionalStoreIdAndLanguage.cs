using Microsoft.EntityFrameworkCore.Migrations;

namespace OptimaJet.DWKit.StarterApplication.Migrations
{
    public partial class OptionalStoreIdAndLanguage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Stores_StoreId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_StoreLanguages_StoreLanguageId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkflowDefinitions_StoreTypes_StoreTypeId",
                table: "WorkflowDefinitions");

            migrationBuilder.AlterColumn<int>(
                name: "StoreTypeId",
                table: "WorkflowDefinitions",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<int>(
                name: "StoreLanguageId",
                table: "Products",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<int>(
                name: "StoreId",
                table: "Products",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Stores_StoreId",
                table: "Products",
                column: "StoreId",
                principalTable: "Stores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_StoreLanguages_StoreLanguageId",
                table: "Products",
                column: "StoreLanguageId",
                principalTable: "StoreLanguages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkflowDefinitions_StoreTypes_StoreTypeId",
                table: "WorkflowDefinitions",
                column: "StoreTypeId",
                principalTable: "StoreTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Stores_StoreId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_StoreLanguages_StoreLanguageId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkflowDefinitions_StoreTypes_StoreTypeId",
                table: "WorkflowDefinitions");

            migrationBuilder.AlterColumn<int>(
                name: "StoreTypeId",
                table: "WorkflowDefinitions",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "StoreLanguageId",
                table: "Products",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "StoreId",
                table: "Products",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Stores_StoreId",
                table: "Products",
                column: "StoreId",
                principalTable: "Stores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_StoreLanguages_StoreLanguageId",
                table: "Products",
                column: "StoreLanguageId",
                principalTable: "StoreLanguages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkflowDefinitions_StoreTypes_StoreTypeId",
                table: "WorkflowDefinitions",
                column: "StoreTypeId",
                principalTable: "StoreTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
