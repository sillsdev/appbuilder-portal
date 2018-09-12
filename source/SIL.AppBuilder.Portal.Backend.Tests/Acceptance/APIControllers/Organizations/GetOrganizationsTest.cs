using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Optimajet.DWKit.StarterApplication.Data;
using Optimajet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Organizations
{
    [Collection("WithoutAuthCollection")]
    public class GetOrganizationsTest : BaseOrganizationTest
    {
        public GetOrganizationsTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task GetOrganizations_None() {
          var response = await Get("/api/organizations");

          Assert.Equal(HttpStatusCode.OK, response.StatusCode);

          var orgs = await DeserializeList<Organization>(response);

          Assert.Equal(0, orgs.Count);
        }


        [Fact]
        public async Task GetOrganizations_Two()
        {
            NeedsTestData<AppDbContext, Organization>(new List<Organization>
            {
                new Organization(),
                new Organization()

            });

            var response = await Get("/api/organizations");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var orgs = await DeserializeList<Organization>(response);

            Assert.Equal(2, orgs.Count);
        }

        [Fact]
        public async Task GetOrganizations_OrganizationProductDefinitions()
        {
            TestDataSetup();
            var testOrgProd = ReadTestData<AppDbContext, OrganizationProductDefinition>().FirstOrDefault();

            var response = await Get("/api/organizations?include=organization-product-definitions");
            var responseString = response.Content.ToString();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var orgs = await DeserializeList<Organization>(response);

            Assert.Equal(3, orgs.Count);
            List<Organization> objList = orgs as List<Organization>;
            Assert.Single(objList[0].OrganizationProductDefinitions);
            var orgProdDefinition = objList[0].OrganizationProductDefinitions[0];
            Assert.Equal(testOrgProd.Id, orgProdDefinition.Id);
            Assert.Null(objList[0].OrganizationMemberships);
        }

        [Fact]
        public async Task GetOrganizations_EmptyOrganizationProductDefinitions()
        {
            TestDataSetup();
            var response = await Get("/api/organizations");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var orgs = await DeserializeList<Organization>(response);

            Assert.Equal(3, orgs.Count);
            List<Organization> objList = orgs as List<Organization>;
            Assert.Null(objList[0].OrganizationProductDefinitions);
            Assert.Null(objList[0].OrganizationMemberships);

        }

    }
}
