using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Utility.Extensions;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Projects
{
    [Collection("HangfireCollection")]
    public class GetProjectsTest : BaseTest<HangfireStartup>
    {
        public GetProjectsTest(TestFixture<HangfireStartup> fixture) : base(fixture)
        {
        }

        public User CurrentUser { get; set; }
        public OrganizationMembership CurrentUserMembership { get; set; }
        public OrganizationMembership CurrentUserMembership2 { get; set; }
        public User user1 { get; private set; }
        public User user2 { get; private set; }
        public User user3 { get; private set; }
        public Organization org1 { get; private set; }
        public Organization org2 { get; private set; }
        public Organization org3 { get; private set; }
        public Group group1 { get; set; }
        public Group group2 { get; set; }
        public Group group3 { get; set; }
        public Group group4 { get; set; }
        public GroupMembership groupMembership1 { get; set; }
        public ApplicationType type1 { get; set; }
        public Project project1 { get; set; }
        public Project project2 { get; set; }
        public Project project3 { get; set; }
        public Project project4 { get; set; }
        public Reviewer reviewer1 { get; set; }
        public Reviewer reviewer2 { get; set; }
        public Reviewer reviewer3 { get; set; }

        private void BuildTestData()
        {
            CurrentUser = NeedsCurrentUser();
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
            CurrentUserMembership = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = CurrentUser.Id,
                OrganizationId = org1.Id
            });
            CurrentUserMembership2 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = CurrentUser.Id,
                OrganizationId = org2.Id
            });
            group1 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup1",
                Abbreviation = "TG1",
                OwnerId = org1.Id
            });
            group2 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup2",
                Abbreviation = "TG2",
                OwnerId = org1.Id
            });
            group3 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup3",
                Abbreviation = "TG3",
                OwnerId = org2.Id
            });
            group4 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup4",
                Abbreviation = "TG4",
                OwnerId = org3.Id
            });
            groupMembership1 = AddEntity<AppDbContext, GroupMembership>(new GroupMembership
            {
                UserId = CurrentUser.Id,
                GroupId = group1.Id
            });
            type1 = AddEntity<AppDbContext, ApplicationType>(new ApplicationType
            {
                Name = "scriptureappbuilder",
                Description = "Scripture App Builder"
            });
            project1 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project1",
                TypeId = type1.Id,
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "eng-AUS",
                IsPublic = true,
                DateArchived = null
            });
            project2 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project2",
                TypeId = type1.Id,
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "eng-US",
                IsPublic = true
            });
            project3 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project3",
                TypeId = type1.Id,
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group3.Id,
                OrganizationId = org2.Id,
                Language = "eng-US",
                IsPublic = true
            });
            project4 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project4",
                TypeId = type1.Id,
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group4.Id,
                OrganizationId = org3.Id,
                Language = "eng-US",
                IsPublic = true
            });

            var productDefinition1 = AddEntity<AppDbContext, ProductDefinition>(new ProductDefinition { 
                Name = "First"
            });

            var product1 = AddEntity<AppDbContext, Product>(new Product {
                ProjectId = project1.Id,
                ProductDefinitionId = productDefinition1.Id
            });

            reviewer1 = AddEntity<AppDbContext, Reviewer>(new Reviewer
            {
                Name = "David Moore",
                Email = "david_moore1@sil.org",
                ProjectId = project1.Id
            });
            reviewer2 = AddEntity<AppDbContext, Reviewer>(new Reviewer
            {
                Name = "Chris Hubbard",
                Email = "chris_hubbard@sil.org",
                ProjectId = project1.Id
            });
            reviewer3 = AddEntity<AppDbContext, Reviewer>(new Reviewer
            {
                Name = "David Moore",
                Email = "david_moore1@sil.org",
                ProjectId = project2.Id
            });

        }

        [Fact]
        public async Task Get_Projects_For_An_OrganizationHeader()
        {
            BuildTestData();

            var url = "/api/projects";
            var response = await Get(url, org1.Id.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Equal(2, projects.Count);

            var ids = projects.Select(p => p.Id);

            Assert.Contains(project1.Id, ids);
            Assert.Contains(project2.Id, ids);
            Assert.DoesNotContain(project3.Id, ids);
            Assert.DoesNotContain(project4.Id, ids);
        }

        [Fact]
        async Task Get_With_No_Organization()
        {
            BuildTestData();
            var url = "/api/projects";
            var response = await Get(url, allOrgs: true);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Equal(3, projects.Count);

            var ids = projects.Select(p => p.Id);

            Assert.Contains(project1.Id, ids);
            Assert.Contains(project2.Id, ids);
            Assert.Contains(project3.Id, ids);
            Assert.DoesNotContain(project4.Id, ids);

        }

        [Fact]
        async Task Get_With_Invalid_Organization()
        {
            BuildTestData();
            var url = "/api/projects";
            var response = await Get(url, org3.Id.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Empty(projects);
        }

        [Fact]
        public async Task GetProjects_IncludeReviewers()
        {
            BuildTestData();
 
            var response = await Get("/api/projects?include=reviewers", allOrgs: true);
            var responseString = response.Content.ToString();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Equal(3, projects.Count);
            var reviewerIds = projects.FirstOrDefault().Reviewers.Select(r => r.Id);
            Assert.Contains(reviewer1.Id, reviewerIds);
            Assert.Contains(reviewer2.Id, reviewerIds);
            Assert.DoesNotContain(reviewer3.Id, reviewerIds);
        }


        [Fact]
        public async Task GetProjects_ForDirectory()
        {
            BuildTestData();

            var response = await Get("/api/projects", addOrgHeader: false);
            
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            var ids = projects.Select(p => p.Id);

            Assert.Contains(project1.Id, ids);
            Assert.Contains(project2.Id, ids);
            Assert.Contains(project3.Id, ids);
            Assert.Contains(project4.Id, ids);
        }

        [Fact]
        public async Task GetProjects_ForDirectory_QueryEverything()
        {
            BuildTestData();

            var now = DateTime.Now;
            var anHourLater = now.AddHours(1);
            var aboutNowAsIso = anHourLater.ToISO8601();

            var url = "/api/projects" + 
                "?filter%5Bproduct-updated-date%5D=le%3A" + aboutNowAsIso + 
                "&filter%5Bdate-archived%5D=isnull%3A" + 
                "&filter%5Blanguage%5D=like%3AAUS" + 
                "&include=organization%2Cgroup%2Cowner%2cproducts" +
                "&page%5Boffset%5D=0" +
                "&page%5Blimit%5D=20";
            var response = await Get(url, addOrgHeader: false);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Equal(1, projects.Count);

            var ids = projects.Select(p => p.Id);

            Assert.Contains(project1.Id, ids);
        }

        [Fact]
        public async Task GetProjects_ForDirectory_QueryLanguage()
        {
            BuildTestData();

            var now = DateTime.Now;
            var anHourLater = now.AddHours(1);
            var aboutNowAsIso = anHourLater.ToISO8601();

            var url = "/api/projects?filter%5Blanguage%5D=like%3AAUS";
            var response = await Get(url, addOrgHeader: false);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Equal(1, projects.Count);

            var ids = projects.Select(p => p.Id);

            Assert.Contains(project1.Id, ids);
        }

        [Fact]
        public async Task GetProjects_ForDirectory_Search_WrongCase()
        {
            BuildTestData();

            var now = DateTime.Now;
            var anHourLater = now.AddHours(1);
            var aboutNowAsIso = anHourLater.ToISO8601();

            var url = "/api/projects?filter%5Bsearch-term%5D=like%3Aaus";
            var response = await Get(url, addOrgHeader: false);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Equal(1, projects.Count);

            var ids = projects.Select(p => p.Id);

            Assert.Contains(project1.Id, ids);
        }

          [Fact]
        public async Task GetProjects_ForDirectory_Search_CapCase()
        {
            BuildTestData();

            var now = DateTime.Now;
            var anHourLater = now.AddHours(1);
            var aboutNowAsIso = anHourLater.ToISO8601();

            var url = "/api/projects?filter%5Bsearch-term%5D=like%3AAUS";
            var response = await Get(url, addOrgHeader: false);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Equal(1, projects.Count);

            var ids = projects.Select(p => p.Id);

            Assert.Contains(project1.Id, ids);
        }        

        [Fact]
        public async Task GetProjects_ForDirectory_Sort_Asc()
        {
            BuildTestData();

            var url = "/api/projects" + 
                "?filter%5Bdate-archived%5D=isnull%3A" + 
                "&include=organization%2Cgroup%2Cowner%2cproducts" +
                "&page%5Boffset%5D=0" +
                "&page%5Blimit%5D=20" +
                "&sort=name";

            var response = await Get(url, addOrgHeader: false);
            var body = await response.Content.ReadAsStringAsync();
            Console.Write(body);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Equal(4, projects.Count);

            var names = projects.Select(p => p.Name);
            var expected = new List<string> {
                "Test Project1",
                "Test Project2",
                "Test Project3",
                "Test Project4"
            }; 
            Assert.Equal(expected, names);
        }

        [Fact]
        public async Task GetProjects_ForDirectory_Sort_Desc()
        {
            BuildTestData();

            var url = "/api/projects" + 
                "?filter%5Bdate-archived%5D=isnull%3A" + 
                "&include=organization%2Cgroup%2Cowner%2cproducts" +
                "&page%5Boffset%5D=0" +
                "&page%5Blimit%5D=20" +
                "&sort=-name";

            var response = await Get(url, addOrgHeader: false);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Equal(4, projects.Count);

            var names = projects.Select(p => p.Name);
            var expected = new List<string> {
                "Test Project4",
                "Test Project3",
                "Test Project2",
                "Test Project1",
            };

            Assert.Equal(expected, names);
        }        
    }
}
