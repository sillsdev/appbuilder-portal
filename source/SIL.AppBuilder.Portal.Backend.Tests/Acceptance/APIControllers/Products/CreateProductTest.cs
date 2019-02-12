using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Moq;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Utility;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Products
{
    [Collection("WithoutAuthCollection")]
    public class CreateProductTest : BaseProductTest
    {
        public CreateProductTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }
        [Fact]
        public async Task Create_Product()
        {
            BuildTestData();
            var hubContext = _fixture.GetService<IHubContext<ScriptoriaHub>>();
            var mockScriptoriaHub = Mock.Get(hubContext);
            mockScriptoriaHub.Reset();
            var mockClients = Mock.Get<IHubClients>(hubContext.Clients);
            mockClients.Reset();

            var content = new
            {
                data = new
                {
                    type = "products",
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
            var response = await Post("/api/products/", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var product = await Deserialize<Product>(response);

            Assert.Equal(project1.Id, product.ProjectId);
            Assert.Equal(productDefinition1.Id, product.ProductDefinitionId);
            // Verify that status update not sent for non project
            mockScriptoriaHub.Verify(x => x.Clients.Group(It.IsAny<string>()), Times.Never());
        }

        [Fact(Skip = "Enabling the updating of a Project in the Product service throws a NullReferenceException. Reason unknown. Unable to debug libraries with VS Code - Preston")]
        public async Task Create_Product_Updates_Project()
        {
            BuildTestData();

            var originalUpdated = project1.DateUpdated;

            var content = new
            {
                data = new
                {
                    type = "products",
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
            var response = await Post("/api/products/", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var project = GetDbSet<Project>().Find(project1.Id);

            var updated = project.DateUpdated;

            Assert.NotEqual(originalUpdated, updated);
        }


        [Fact]
        public async Task Create_Product_With_Store()
        {
            BuildTestData();

            var content = new
            {
                data = new
                {
                    type = "products",
                    relationships = new Dictionary<string, Dictionary<string, Dictionary<string, string>>>() {
                            {"project", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "projects" },
                                    { "id", project5.Id.ToString() }
                                }}}},
                            {"product-definition", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "product-definitions" },
                                    { "id", productDefinition4.Id.ToString() }
                            }}}},
                            {"store", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "stores" },
                                    { "id", store1.Id.ToString() }
                            }}}},
                           {"store-language", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "store-languages" },
                                        { "id", storeLang1.Id.ToString() }
                            }}}}

                        }
                }
            };

            var response = await Post("/api/products/", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var product = await Deserialize<Product>(response);

            Assert.Equal(project5.Id, product.ProjectId);
            Assert.Equal(productDefinition4.Id, product.ProductDefinitionId);
            Assert.Equal(store1.Id, product.StoreId);
            Assert.Equal(storeLang1.Id, product.StoreLanguageId);
        }
        [Fact]
        public async Task Create_Product_With_Invalid_Store_Info()
        {
            BuildTestData();

            var content = new
            {
                data = new
                {
                    type = "products",
                    relationships = new Dictionary<string, Dictionary<string, Dictionary<string, string>>>() {
                            {"project", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "projects" },
                                    { "id", project5.Id.ToString() }
                                }}}},
                            {"product-definition", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "product-definitions" },
                                    { "id", productDefinition4.Id.ToString() }
                            }}}},
                            {"store", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "stores" },
                                    { "id", store2.Id.ToString() }
                            }}}},
                           {"store-language", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "store-languages" },
                                        { "id", storeLang1.Id.ToString() }
                            }}}}

                        }
                }
            };

            var response = await Post("/api/products/", content);

            Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        }

        [Fact]
        public async Task Organization_Mismatch_Failure()
        {
            BuildTestData();

            var content = new
            {
                data = new
                {
                    type = "products",
                    relationships = new Dictionary<string, Dictionary<string, Dictionary<string, string>>>() {
                            {"project", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "projects" },
                                    { "id", project3.Id.ToString() }
                                }}}},
                            {"product-definition", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "product-definitions" },
                                    { "id", productDefinition1.Id.ToString() }
                            }}}}
                        }
                }
            };
            var response = await Post("/api/products/", content);

            Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        }
        [Fact]
        public async Task CurrentUser_Failure()
        {
            BuildTestData();

            var content = new
            {
                data = new
                {
                    type = "products",
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
            var response = await Post("/api/products/", content);

            Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        }
        [Fact]
        public async Task CurrentUser_SuperAdmin()
        {
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
            var response = await Post("/api/products/", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }
        [Fact]
        public async Task Create_Product_Failure_NoUrl()
        {
            BuildTestData();

            var content = new
            {
                data = new
                {
                    type = "products",
                    relationships = new Dictionary<string, Dictionary<string, Dictionary<string, string>>>() {
                            {"project", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "projects" },
                                    { "id", project7.Id.ToString() }
                                }}}},
                            {"product-definition", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "product-definitions" },
                                    { "id", productDefinition1.Id.ToString() }
                            }}}}
                        }
                }
            };
            var response = await Post("/api/products/", content);

            Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);

        }
    }
}
