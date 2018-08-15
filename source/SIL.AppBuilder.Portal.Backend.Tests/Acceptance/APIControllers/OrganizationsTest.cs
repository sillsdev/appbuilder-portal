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

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    [Collection("WithoutAuthCollection")]
    public class OrganizationControllerTests : BaseTest<NoAuthStartup>
    {
        public OrganizationControllerTests(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }

        private void TestDataSetup()
        {
            var currentUser = AddEntity<AppDbContext, User>(new User
            {
                ExternalId = "test-auth0-id",
                Email = "test-email@test.test",
                Name = "Test Testenson",
                GivenName = "Test",
                FamilyName = "Testenson"
            });
            var org1 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg1",
                WebsiteUrl = "https://testorg1.org",
                BuildEngineUrl = "https://buildengine.testorg1",
                BuildEngineApiAccessToken = "replace",
                OwnerId = currentUser.Id

            });
            var org2 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg2",
                WebsiteUrl = "https://testorg2.org",
                BuildEngineUrl = "https://buildengine.testorg2",
                BuildEngineApiAccessToken = "replace",
                OwnerId = currentUser.Id

            });
            var org3 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg3",
                WebsiteUrl = "https://testorg3.org",
                BuildEngineUrl = "https://buildengine.testorg3",
                BuildEngineApiAccessToken = "replace",
                OwnerId = currentUser.Id

            });
            var orgMembership = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = currentUser.Id,
                OrganizationId = org1.Id
            });
            var appType1 = AddEntity<AppDbContext, ApplicationType>(new ApplicationType
            {
                Name = "TestApp1"
            });
            var workflow1 = AddEntity<AppDbContext, WorkflowDefinition>(new WorkflowDefinition
            {
                Name = "TestWorkFlow",
                Enabled = true,
                Description = "This is a test workflow",
                WorkflowScheme = "Don't know what this is"
            });
            var productDefinition1 = AddEntity<AppDbContext, ProductDefinition>(new ProductDefinition
            {
                Name = "TestProd1",
                TypeId = appType1.Id,
                Description = "This is a test product",
                WorkflowId = workflow1.Id
            });
            var productDefinition2 = AddEntity<AppDbContext, ProductDefinition>(new ProductDefinition
            {
                Name = "TestProd2",
                TypeId = appType1.Id,
                Description = "This is test product 2",
                WorkflowId = workflow1.Id

            });
            var orgProductDefinition1 = AddEntity<AppDbContext, OrganizationProductDefinition>(new OrganizationProductDefinition
            {
                OrganizationId = org1.Id,
                ProductDefinitionId = productDefinition1.Id
            });
            var orgProductDefinition2 = AddEntity<AppDbContext, OrganizationProductDefinition>(new OrganizationProductDefinition
            {
                OrganizationId = org2.Id,
                ProductDefinitionId = productDefinition2.Id
            });

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
