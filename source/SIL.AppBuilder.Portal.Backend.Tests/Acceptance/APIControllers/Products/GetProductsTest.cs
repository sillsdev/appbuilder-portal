using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using OptimaJet.DWKit.StarterApplication.Models;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Products
{
    [Collection("WithoutAuthCollection")]
    public class GetProductsTest : BaseProductTest
    {
        public GetProductsTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }
        [Fact]
        public async Task Get_Products_For_An_OrganizationHeader()
        {
            BuildTestData();

            var url = "/api/products";
            var response = await Get(url, org1.Id.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var products = await DeserializeList<Product>(response);

            Assert.Equal(1, products.Count);

            var ids = products.Select(p => p.Id);

            // Should only return the single project associated with org1
            Assert.Contains(product1.Id, ids);
            Assert.DoesNotContain(product2.Id, ids);
            Assert.DoesNotContain(product3.Id, ids);
        }
        [Fact]
        public async Task Get_Products_For_An_Empty_OrganizationHeader()
        {
            BuildTestData();

            var url = "/api/products";
            var response = await Get(url, allOrgs: true);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var products = await DeserializeList<Product>(response);

            Assert.Equal(3, products.Count);

            var ids = products.Select(p => p.Id);

            // Should return both of the products accessible by current user
            Assert.Contains(product1.Id, ids);
            Assert.Contains(product3.Id, ids);
            Assert.Contains(product4.Id, ids);
            Assert.DoesNotContain(product2.Id, ids);
        }
        [Fact]
        public async Task Get_Products_For_An_Invalid_OrganizationHeader()
        {
            // Try to access for organization number that current user is
            // not a member of
            BuildTestData();

            var url = "/api/products";
            var response = await Get(url, org3.Id.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var products = await DeserializeList<Product>(response);

            Assert.Empty(products);
        }

    }
}
