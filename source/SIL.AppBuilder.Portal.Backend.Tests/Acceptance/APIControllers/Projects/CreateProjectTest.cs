using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Optimajet.DWKit.StarterApplication.Data;
using Optimajet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Projects
{
    [Collection("WithoutAuthCollection")]
    public class CreateProjectTest : BaseTest<NoAuthStartup>
    {
        public CreateProjectTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
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
            project1 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project1",
                Type = "scriptureappbuilder",
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "eng-US",
                Private = false
            });
            project2 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project2",
                Type = "scriptureappbuilder",
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "eng-US",
                Private = false
            });
            project3 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project3",
                Type = "scriptureappbuilder",
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group3.Id,
                OrganizationId = org2.Id,
                Language = "eng-US",
                Private = false
            });
            project4 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project4",
                Type = "scriptureappbuilder",
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group4.Id,
                OrganizationId = org3.Id,
                Language = "eng-US",
                Private = false
            });
        }
        [Fact]
        public async Task Create_Project()
        {
            BuildTestData();

            var content = new
            {
                data = new
                {
                    type = "projects",
                    attributes = new
                    {
                        name = "project5",
                        type = "scriptureappbuilder",
                        description = "description",
                        language = "eng-US"
                    },
                    relationships = new
                    {
                        owner = new
                        {
                            data = new
                            {
                                type = "users",
                                id = CurrentUser.Id.ToString()
                            }
                        },
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
            var response = await Post("/api/projects/", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var project = await Deserialize<Project>(response);

            Assert.Equal(CurrentUser.Id, project.OwnerId );
            Assert.Equal(org1.Id, project.OrganizationId );
            Assert.Equal(group1.Id, project.GroupId);
            Assert.Equal("project5", project.Name);
        }
        [Fact]
        public async Task Create_Project_GroupOwner_Organization_Mismatch()
        {
            BuildTestData();

            var content = new
            {
                data = new
                {
                    type = "projects",
                    attributes = new
                    {
                        name = "project5",
                        type = "scriptureappbuilder",
                        description = "description",
                        language = "eng-US"
                    },
                    relationships = new
                    {
                        owner = new
                        {
                            data = new
                            {
                                type = "users",
                                id = CurrentUser.Id.ToString()
                            }
                        },
                        organization = new
                        {
                            data = new
                            {
                                type = "organizations",
                                id = org2.Id.ToString()
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
            var response = await Post("/api/projects/", content);

            Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);

        }
        [Fact]
        public async Task Create_Project_Owner_Not_Organization_Member()
        {
            BuildTestData();

            var content = new
            {
                data = new
                {
                    type = "projects",
                    attributes = new
                    {
                        name = "project5",
                        type = "scriptureappbuilder",
                        description = "description",
                        language = "eng-US"
                    },
                    relationships = new
                    {
                        owner = new
                        {
                            data = new
                            {
                                type = "users",
                                id = user1.Id.ToString()
                            }
                        },
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
            var response = await Post("/api/projects/", content);

            Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);

        }
        [Fact]
        public async Task Create_Project_CurrentUser_Not_Organization_Member()
        {
            BuildTestData();

            var content = new
            {
                data = new
                {
                    type = "projects",
                    attributes = new
                    {
                        name = "project5",
                        type = "scriptureappbuilder",
                        description = "description",
                        language = "eng-US"
                    },
                    relationships = new
                    {
                        owner = new
                        {
                            data = new
                            {
                                type = "users",
                                id = user1.Id.ToString()
                            }
                        },
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
                        }
                    }
                }
            };
            var response = await Post("/api/projects/", content);

            Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);

        }


    }
}

