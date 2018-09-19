using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using OptimaJet.DWKit.StarterApplication.Models;
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
        public async Task Organization_Inaccessible_Failure()
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

    }
}
