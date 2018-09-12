using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Optimajet.DWKit.StarterApplication.Data;
using Optimajet.DWKit.StarterApplication.Models;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Organizations
{
    [Collection("WithoutAuthCollection")]
    public class CreateOrganizationTest : BaseOrganizationTest
    {
        public CreateOrganizationTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }
        [Fact]
        public async Task Create_Organization()
        {
            TestDataSetup();

            var content = new
            {
                data = new
                {
                    type = "organizations",
                    attributes = new Dictionary<string, string>()
                    {
                        {"name", "testorg"},
                        {"website-url", "http://test.org"},
                        {"build-engine-url", "http://buildengine.com"},
                        {"build-engine-api-access-token", "4323864"},
                        {"use-sil-build-infrastructure", "false"},
                        {"public-by-default", "false"}
                    }
                }
            };
            var response = await Post("/api/organizations/", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var org = await Deserialize<Organization>(response);

            Assert.Equal(CurrentUser.Id, org.OwnerId);
            Assert.False(org.UseSilBuildInfrastructure);
            Assert.False(org.PublicByDefault);
        }
        [Fact]
        public async Task Create_Organization_True_Values()
        {
            TestDataSetup();

            var content = new
            {
                data = new
                {
                    type = "organizations",
                    attributes = new Dictionary<string, string>()
                    {
                        {"name", "testorg"},
                        {"website-url", "http://test.org"},
                        {"build-engine-url", "http://buildengine.com"},
                        {"build-engine-api-access-token", "4323864"},
                        {"use-sil-build-infrastructure", "true"},
                        {"public-by-default", "true"}
                    }
                }
            };
            var response = await Post("/api/organizations/", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var org = await Deserialize<Organization>(response);

            Assert.Equal(CurrentUser.Id, org.OwnerId);
            Assert.True(org.UseSilBuildInfrastructure);
            Assert.True(org.PublicByDefault);
        }

        [Fact]
        public async Task Create_Organization_Defaults_Read_Record()
        {
            TestDataSetup();

            var content = new
            {
                data = new
                {
                    type = "organizations",
                    attributes = new Dictionary<string, string>()
                    {
                        {"name", "testorg"},
                        {"website-url", "http://test.org"},
                        {"build-engine-url", "http://buildengine.com"},
                        {"build-engine-api-access-token", "4323864"}
                    }
                }
            };
            var response = await Post("/api/organizations/", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var org = await Deserialize<Organization>(response);

            Assert.Equal(CurrentUser.Id, org.OwnerId);
            Assert.True(org.UseSilBuildInfrastructure);
            Assert.True(org.PublicByDefault);

        }

    }
}
