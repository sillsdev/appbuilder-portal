using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Optimajet.DWKit.StarterApplication.Models;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Products
{
    [Collection("WithoutAuthCollection")]
    public class UpdateProductTest : BaseProductTest
    {
        public UpdateProductTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }
        [Fact]
        public async Task Patch_Project()
        {
            BuildTestData();
            var content = new
            {
                data = new
                {
                    type = "products",
                    id = product1.Id.ToString(),
                    relationships = new
                    {
                        project = new
                        {
                            data = new
                            {
                                type = "projects",
                                id = project2.Id.ToString()
                            }
                        }
                    }
                }
            };
            var response = await Patch("/api/products/" + product1.Id.ToString(), content);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var updatedProduct = await Deserialize<Product>(response);

            Assert.Equal(updatedProduct.ProjectId, project2.Id);
        }
        [Fact]
        public async Task Patch_To_Invalid_Project()
        {
            // This test should create a failure because the organization associated
            // with the new project is not the same as the project associated
            // with the product definition.  There is no organization product definition
            // for productdefinition1 with organization2
            BuildTestData();
            var content = new
            {
                data = new
                {
                    type = "products",
                    id = product1.Id.ToString(),
                    relationships = new
                    {
                        project = new
                        {
                            data = new
                            {
                                type = "projects",
                                id = project3.Id.ToString()
                            }
                        }
                    }
                }
            };
            var response = await Patch("/api/products/" + product1.Id.ToString(), content);

            Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        }
        [Fact]
        public async Task Patch_CurrentUser_Failure()
        {
            // User not a member of the resulting organization
            BuildTestData();
            var content = new
            {
                data = new
                {
                    type = "products",
                    id = product1.Id.ToString(),
                    relationships = new Dictionary<string, Dictionary<string, Dictionary<string, string>>>() {
                            {"project", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "projects" },
                                    { "id", project4.Id.ToString() }
                                }}}},
                            {"product-definition", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "product-definitions" },
                                    { "id", productDefinition3.Id.ToString() }
                            }}}}
                        }
                }
            };
            var response = await Patch("/api/products/" + product1.Id.ToString(), content);

            Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);

        }
        [Fact]
        public async Task Patch_Inacccessible_Project()
        {
            // This test should fail because the current user can't access the project
            BuildTestData();
            var content = new
            {
                data = new
                {
                    type = "products",
                    id = product2.Id.ToString(),
                    relationships = new Dictionary<string, Dictionary<string, Dictionary<string, string>>>() {
                            {"project", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "projects" },
                                    { "id", project1.Id.ToString() }
                                }}}},
                            {"product-definition", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "product-definitions" },
                                    { "id", productDefinition1.Id.ToString() }
                            }}}}
                        }
                }
            };
            var response = await Patch("/api/products/" + product2.Id.ToString(), content);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
