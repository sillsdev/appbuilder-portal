using System;
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
    public class ProjectsTest : BaseTest<NoAuthStartup>
    {
        public ProjectsTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
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
            var group1 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup1",
                Abbreviation = "TG1",
                OwnerId = org1.Id
            });
            var groupMembership1 = AddEntity<AppDbContext, GroupMembership>(new GroupMembership
            {
                UserId = currentUser.Id,
                GroupId = group1.Id
            });

            var project1 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "TestProject1",
                Type = "scriptureappbuilder",
                Description = "This is a test project",
                OwnerId = currentUser.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "en",
                Private = false,

            });
            var project2 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "TestProject2",
                Type = "readingappbuilder",
                Description = "This is a test project",
                OwnerId = currentUser.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "en",
                Private = false,

            });

            var reviewer1 = AddEntity<AppDbContext, Reviewer>(new Reviewer
            {
                Name = "David Moore",
                Email = "david_moore1@sil.org",
                ProjectId = project1.Id
            });
            var reviewer2 = AddEntity<AppDbContext, Reviewer>(new Reviewer
            {
                Name = "Chris Hubbard",
                Email = "chris_hubbard@sil.org",
                ProjectId = project1.Id
            });
            var reviewer3 = AddEntity<AppDbContext, Reviewer>(new Reviewer
            {
                Name = "David Moore",
                Email = "david_moore1@sil.org",
                ProjectId = project2.Id
            });
        }

        [Fact]
        public async Task GetProjects_IncludeReviewers()
        {
            TestDataSetup();
            var testReviewer = ReadTestData<AppDbContext, Reviewer>().FirstOrDefault();

            var response = await Get("/api/projects?include=reviewers");
            var responseString = response.Content.ToString();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Equal(2, projects.Count);
            List<Project> objList = projects as List<Project>;
            Assert.Equal(2, objList[0].Reviewers.Count);
            var reviewer = objList[0].Reviewers[0];
            Assert.Equal(testReviewer.Id, reviewer.Id);
        }
    }

}
