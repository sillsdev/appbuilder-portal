using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Projects
{
    [Collection("HangfireCollection")]
    public class UpdateProjectTest : BaseTest<HangfireStartup>
    {
        public UpdateProjectTest(TestFixture<HangfireStartup> fixture) : base(fixture)
        {
        }

        public User CurrentUser { get; set; }
        public OrganizationMembership CurrentUserMembership { get; set; }
        public OrganizationMembership CurrentUserMembership2 { get; set; }
        public OrganizationMembership CurrentUserMembership3 { get; set; }
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

        private void BuildTestData()
        {
            CurrentUser = NeedsCurrentUser();
            user1 = AddEntity<AppDbContext, User>(new User
            {
                ExternalId = "test-auth0-id1",
                Email = "test-email1@test.test",
                Name = "Test Testenson1",
                GivenName = "Test1",
                FamilyName = "Testenson1"
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
            CurrentUserMembership3 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = user1.Id,
                OrganizationId = org3.Id
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
                Language = "eng-US",
                IsPublic = true
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
        }
        [Fact]
        public async Task Patch_Project()
        {
            BuildTestData();

            var expectedName = project1.Name + "-updated!";
            var payload = ResourcePatchPayload(
                "projects", project1.Id, new Dictionary<string, object>()
                {
                    { "name", expectedName }
                });

            var response = await Patch("/api/projects/" + project1.Id, payload);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var updatedProject = await Deserialize<Project>(response);

            Assert.Equal(expectedName, updatedProject.Name);
        }
        [Fact]
        public async Task Patch_ProjectForOrganization()
        {
            BuildTestData();

            var expectedName = project1.Name + "-updated!";
            var payload = ResourcePatchPayload(
                "projects", project1.Id, new Dictionary<string, object>()
                {
                    { "name", expectedName }
                });

            var response = await Patch("/api/projects/" + project1.Id, payload, project1.OrganizationId.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var updatedProject = await Deserialize<Project>(response);

            Assert.Equal(expectedName, updatedProject.Name);

        }
        [Fact]
        public async Task Patch_ProjectForOtherOrganization_Failure()
        {
            BuildTestData();

            var expectedName = project1.Name + "-updated!";
            var payload = ResourcePatchPayload(
                "projects", project1.Id, new Dictionary<string, object>()
                {
                    { "name", expectedName }
                });

            var response = await Patch("/api/projects/" + project1.Id, payload, org3.Id.ToString());

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
        [Fact]
        public async Task Patch_Invalid_Project()
        {
            BuildTestData();

            var expectedName = project4.Name + "-updated!";
            var payload = ResourcePatchPayload(
                "projects", project4.Id, new Dictionary<string, object>()
                {
                    { "name", expectedName }
                });

            var response = await Patch("/api/projects/" + project4.Id, payload);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
        [Fact]
        public async Task Patch_Organization_And_Group()
        {
            BuildTestData();
            var content = new
            {
                data = new
                {
                    type = "projects",
                    id = project3.Id.ToString(),
                    relationships = new
                    {
                        organization = new
                        {
                            data = new
                            {
                                type = "organizations",
                                id = org1.Id.ToString()
                            }
                        },
                        group = new
                        {
                            data = new
                            {
                                type = "groups",
                                id = group1.Id.ToString()
                            }
                        }
                    }
                }
            };
            var response = await Patch("/api/projects/" + project3.Id.ToString(), content);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var updatedProject = await Deserialize<Project>(response);

            Assert.Equal(updatedProject.GroupId, group1.Id);
            Assert.Equal(updatedProject.OrganizationId, org1.Id);

        }
        //
        // Verify that you can't set the organization to a different value than the group.owner
        [Fact]
        public async Task Patch_Organization_Failure()
        {
            BuildTestData();
            var content = new
            {
                data = new
                {
                    type = "projects",
                    id = project3.Id.ToString(),
                    relationships = new
                    {
                        organization = new
                        {
                            data = new
                            {
                                type = "organizations",
                                id = org1.Id.ToString()
                            }
                        }
                    }
                }
            };
            var response = await Patch("/api/projects/" + project3.Id.ToString(), content);

            Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);

        }
        // Verify that you can't change the owner to a user who is not a member of the organization
        [Fact]
        public async Task Patch_Owner_Failure()
        {
            BuildTestData();
            var content = new
            {
                data = new
                {
                    type = "projects",
                    id = project3.Id.ToString(),
                    relationships = new
                    {
                        owner = new
                        {
                            data = new
                            {
                                type = "users",
                                id = user1.Id.ToString()
                            }
                        }
                    }
                }
            };
            var response = await Patch("/api/projects/" + project3.Id.ToString(), content);

            Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);

        }
        [Fact]
        public async Task Patch_CurrentUser_Failure()
        {
            BuildTestData();
            var content = new
            {
                data = new
                {
                    type = "projects",
                    id = project3.Id.ToString(),
                    relationships = new
                    {
                        organization = new
                        {
                            data = new
                            {
                                type = "organizations",
                                id = org3.Id.ToString()
                            }
                        },
                        group = new
                        {
                            data = new
                            {
                                type = "groups",
                                id = group4.Id.ToString()
                            }
                        },
                        owner = new
                        {
                            data = new
                            {
                                type = "users",
                                id = user1.Id.ToString()
                            }
                        }

                    }
                }
            };
            var response = await Patch("/api/projects/" + project3.Id.ToString(), content);

            Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);

        }
    }
}


