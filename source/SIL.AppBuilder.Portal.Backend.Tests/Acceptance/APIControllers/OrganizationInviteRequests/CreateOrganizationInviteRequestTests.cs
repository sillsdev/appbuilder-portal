using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Hangfire;
using Hangfire.Common;
using Hangfire.States;
using Moq;
using OptimaJet.DWKit.StarterApplication.Services;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;
namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.OrganizationInviteRequests
{
    [Collection("HangfireCollection")]
    public class CreateOrganizationInviteRequestTests : BaseTest<HangfireStartup>
    {
        protected Mock<IBackgroundJobClient> clientMock;
        public CreateOrganizationInviteRequestTests(TestFixture<HangfireStartup> fixture) : base(fixture)
        {
            clientMock = fixture.GetService<Mock<IBackgroundJobClient>>();
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
