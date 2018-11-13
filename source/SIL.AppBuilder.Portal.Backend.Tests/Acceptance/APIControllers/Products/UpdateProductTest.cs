using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
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
            // Besides checking for a valid update, this also verifies the case
            // of where the store fields are not filled in.  It still passes because
            // the checks are not made if the store field is not set
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
        public async Task Patch_Project_With_Store()
        {
            // This test checks that if all the store related fields are filled in
            // and a request is made that doesn't cause the checks to fail, the 
            // update is successful
            BuildTestData();
            var content = new
            {
                data = new
                {
                    type = "products",
                    id = product4.Id.ToString(),
                    relationships = new
                    {
                        project = new
                        {
                            data = new
                            {
                                type = "projects",
                                id = project6.Id.ToString()
                            }
                        }
                    }
                }
            };
            var response = await Patch("/api/products/" + product4.Id.ToString(), content);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var updatedProduct = await Deserialize<Product>(response);

            Assert.Equal(updatedProduct.ProjectId, project6.Id);
        }
        [Fact]
        public async Task Patch_To_Bad_Store()
        {
            // This test should create a failure because changing the store causes
            // it to fail all three of the store related checks in the form
            BuildTestData();
            var content = new
            {
                data = new
                {
                    type = "products",
                    id = product4.Id.ToString(),
                    relationships = new
                    {
                        store = new
                        {
                            data = new
                            {
                                type = "stores",
                                id = store2.Id.ToString()
                            }
                        }
                    }
                }
            };
            var response = await Patch("/api/products/" + product4.Id.ToString(), content);

            Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
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
        public async Task Patch_CurrentUser_SuperAdmin()
        {
            // User not a member of the resulting organization
            BuildTestData();
            var roleSA = AddEntity<AppDbContext, Role>(new Role
            {
                RoleName = RoleName.SuperAdmin
            });
            var userRole1 = AddEntity<AppDbContext, UserRole>(new UserRole
            {
                UserId = CurrentUser.Id,
                RoleId = roleSA.Id
            });

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

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

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
