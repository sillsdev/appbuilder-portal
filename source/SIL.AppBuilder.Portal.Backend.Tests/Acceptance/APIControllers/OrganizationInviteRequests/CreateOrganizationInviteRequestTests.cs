using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Hangfire;
using Hangfire.Common;
using Hangfire.States;
using Moq;
using OptimaJet.DWKit.StarterApplication.Services;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;
namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.OrganizationInviteRequests
{
    [Collection("WithoutAuthCollection")]
    public class CreateOrganizationInviteRequestTests : BaseTest<NoAuthStartup>
    {
        public CreateOrganizationInviteRequestTests(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }



        [Fact]
        public async Task Create_OrganizationInviteRequest()
        {
            var content = new
            {
                data = new
                {
                    type = "organization-invite-requests",
                    attributes = new Dictionary<string, string>() {
                        { "name", "requestor name"},
                        { "org-admin-email", "requestor@name.org"},
                        { "website-url", "https://name.org"}
                    }
                }
            };

            var backgroundJobClient = _fixture.GetService<IBackgroundJobClient>();
            var clientMock = Mock.Get(backgroundJobClient);

            var response = await Post("/api/organization-invite-requests", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            clientMock.Verify(x => x.Create(
                It.Is<Job>(job => 
                           job.Method.Name == "Process" && 
                           job.Type == typeof(IOrganizationInviteRequestService)),
                It.IsAny<EnqueuedState>()));
        }
    }
}
