using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.UserTasks
{
    [Collection("WithoutAuthCollection")]
    public class GetUserTasksTest : BaseTest<NoAuthStartup>
    {
        public GetUserTasksTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
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
        public UserTask userTask1 { get; set; }
        public UserTask userTask2 { get; set; }
        public UserTask userTask3 { get; set; }

        private void BuildTestData()
        {
            var userData = NeedsConfiguredCurrentUser();
            CurrentUser = userData.Item1;
            CurrentUserMembership = userData.Item2;
            org1 = userData.Item3;
          
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
            
            CurrentUserMembership2 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = CurrentUser.Id,
                OrganizationId = org2.Id
            });

            userTask1 = AddEntity<AppDbContext, UserTask>(new UserTask {
              Product = new Product {
                Project = new Project {
                  Organization = org1
                }
              },
              // something is adding additional conditions to the query
              // so value just needs to be set to *something*
              UserId = CurrentUser.Id,
            });

            userTask2 = AddEntity<AppDbContext, UserTask>(new UserTask {
              Product = new Product {
                Project = new Project {
                  Organization = org2
                }
              },
              // something is adding additional conditions to the query
              // so value just needs to be set to *something*
              UserId = CurrentUser.Id,
            });

            userTask3 = AddEntity<AppDbContext, UserTask>(new UserTask {
              Product = new Product {
                Project = new Project {
                  Organization = org3
                }
              },
              // something is adding additional conditions to the query
              // so value just needs to be set to *something*
              UserId = CurrentUser.Id,
            });
        }

        [Fact]
        public async Task Get_UserTasks_With_An_OrganizationHeader()
        {
            BuildTestData();

            var url = "/api/user-tasks/";
            var response = await Get(url, org1.Id.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var list = await DeserializeList<UserTask>(response);
            var ids = list.Select(userTask => userTask.Id);

            Assert.Single(list);
            Assert.Contains(userTask1.Id, ids);
        }

        [Fact]
        public async Task Get_UserTasks_ForAllMemberedOrganizations()
        {
            BuildTestData();

            var url = "/api/user-tasks/";
            var response = await Get(url, allOrgs: true);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var list = await DeserializeList<UserTask>(response);
            var ids = list.Select(userTask => userTask.Id);

            Assert.Equal(2, (int)list.Count());
            Assert.Contains(userTask1.Id, ids);
            Assert.Contains(userTask2.Id, ids);
            Assert.DoesNotContain(userTask3.Id, ids);
        }
    }
}
