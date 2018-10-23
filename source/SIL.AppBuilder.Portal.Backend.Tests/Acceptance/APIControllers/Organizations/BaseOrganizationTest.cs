using System;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Organizations
{
    public class BaseOrganizationTest : BaseTest<NoAuthStartup>
    {
        public BaseOrganizationTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }
        public User CurrentUser { get; set; }
        public Organization org1 { get; private set; }
        public Organization org2 { get; private set; }
        public Organization org3 { get; private set; }
        public OrganizationMembership orgMembership { get; private set; }
        public ApplicationType appType1 { get; private set; }
        public WorkflowDefinition workflow1 { get; set; }
        public ProductDefinition productDefinition1 { get; set; }
        public ProductDefinition productDefinition2 { get; set; }
        public OrganizationProductDefinition orgProduct1 { get; set; }
        public OrganizationProductDefinition orgProduct2 { get; set; }

        protected void TestDataSetup()
        {
            CurrentUser = AddEntity<AppDbContext, User>(new User
            {
                ExternalId = "test-auth0-id",
                Email = "test-email@test.test",
                Name = "Test Testenson",
                GivenName = "Test",
                FamilyName = "Testenson"
            });
            org1 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg1",
                WebsiteUrl = "https://testorg1.org",
                BuildEngineUrl = "https://buildengine.testorg1",
                BuildEngineApiAccessToken = "replace",
                OwnerId = CurrentUser.Id

            });
            org2 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg2",
                WebsiteUrl = "https://testorg2.org",
                BuildEngineUrl = "https://buildengine.testorg2",
                BuildEngineApiAccessToken = "replace",
                OwnerId = CurrentUser.Id

            });
            org3 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg3",
                WebsiteUrl = "https://testorg3.org",
                BuildEngineUrl = "https://buildengine.testorg3",
                BuildEngineApiAccessToken = "replace",
                OwnerId = CurrentUser.Id

            });
            orgMembership = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = CurrentUser.Id,
                OrganizationId = org1.Id
            });
            appType1 = AddEntity<AppDbContext, ApplicationType>(new ApplicationType
            {
                Name = "TestApp1",
                Description = "Test Application"
            });
            workflow1 = AddEntity<AppDbContext, WorkflowDefinition>(new WorkflowDefinition
            {
                Name = "TestWorkFlow",
                Enabled = true,
                Description = "This is a test workflow",
                WorkflowScheme = "Don't know what this is"
            });
            productDefinition1 = AddEntity<AppDbContext, ProductDefinition>(new ProductDefinition
            {
                Name = "TestProd1",
                TypeId = appType1.Id,
                Description = "This is a test product",
                WorkflowId = workflow1.Id
            });
            productDefinition2 = AddEntity<AppDbContext, ProductDefinition>(new ProductDefinition
            {
                Name = "TestProd2",
                TypeId = appType1.Id,
                Description = "This is test product 2",
                WorkflowId = workflow1.Id

            });
            orgProduct1 = AddEntity<AppDbContext, OrganizationProductDefinition>(new OrganizationProductDefinition
            {
                OrganizationId = org1.Id,
                ProductDefinitionId = productDefinition1.Id
            });
            orgProduct2 = AddEntity<AppDbContext, OrganizationProductDefinition>(new OrganizationProductDefinition
            {
                OrganizationId = org2.Id,
                ProductDefinitionId = productDefinition2.Id
            });

        }

    }
}
