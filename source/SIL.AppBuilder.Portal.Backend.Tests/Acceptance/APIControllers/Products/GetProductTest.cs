using System;
using System.Net;
using System.Threading.Tasks;
using Optimajet.DWKit.StarterApplication.Models;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Products
{
    [Collection("WithoutAuthCollection")]
    public class GetProductTest : BaseProductTest
    {
        public GetProductTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }
        [Fact]
        public async Task Get_Product_With_An_OrganizationHeader()
        {
            BuildTestData();

            var url = "/api/products/" + product1.Id.ToString();
            var response = await Get(url, org1.Id.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var product = await Deserialize<Product>(response);

            Assert.Equal(product.Id, product1.Id);
        }
        [Fact]
        public async Task Get_Product_With_Empty_OrganizationHeader()
        {
            BuildTestData();

            var url = "/api/products/" + product1.Id.ToString();
            var response = await Get(url, "");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var product = await Deserialize<Product>(response);

            Assert.Equal(product.Id, product1.Id);
        }
        [Fact]
        public async Task Get_Invalid_Product()
        {
            // Attempt to get product that has an organization that the current
            // user is not a member of
            BuildTestData();

            var url = "/api/products/" + product2.Id.ToString();
            var response = await Get(url, "");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
        [Fact]
        public async Task Get_Product_With_Wrong_Organization()
        {
            BuildTestData();

            var url = "/api/products/" + product3.Id.ToString();
            var response = await Get(url, org1.Id.ToString());

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

    }
}
