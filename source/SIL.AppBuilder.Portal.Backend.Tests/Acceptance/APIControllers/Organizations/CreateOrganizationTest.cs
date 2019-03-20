using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
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
                        {"use-default-build-engine", "false"},
                        {"public-by-default", "false"}
                    }
                }
            };
            var response = await Post("/api/organizations/", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var org = await Deserialize<Organization>(response);

            Assert.Equal(CurrentUser.Id, org.OwnerId);
            Assert.False(org.UseDefaultBuildEngine);
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
                        {"use-default-build-engine", "true"},
                        {"public-by-default", "true"}
                    }
                }
            };
            var response = await Post("/api/organizations/", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var org = await Deserialize<Organization>(response);

            Assert.Equal(CurrentUser.Id, org.OwnerId);
            Assert.True(org.UseDefaultBuildEngine);
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
            Assert.True(org.UseDefaultBuildEngine);
            Assert.True(org.PublicByDefault);

        }
        [Fact]
        public async Task Create_Organization_With_Owner()
        {
            TestDataSetup();

            var content = new
            {
                data = new
                {
                    type = "organizations",
                    attributes = new Dictionary<string, string>()
                    {
                        {"name", "testorgwithowner"},
                        {"website-url", "http://test.org"},
                        {"build-engine-url", "http://buildengine.com"},
                        {"build-engine-api-access-token", "4323864"},
                        {"use-default-build-engine", "false"},
                        {"public-by-default", "false"}
                    },
                    relationships = new Dictionary<string, Dictionary<string, Dictionary<string, string>>>() {
                            {"owner", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "users" },
                                    { "id", user2.Id.ToString() }
                                }}}}
                    }
                }
            };
            var response = await Post("/api/organizations/", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var org = await Deserialize<Organization>(response);

            Assert.Equal(user2.Id, org.OwnerId);
            Assert.False(org.UseDefaultBuildEngine);
            Assert.False(org.PublicByDefault);
            var orgs = ReadTestData<AppDbContext, Organization>();
            Assert.Equal(4, orgs.Count);
            var newOrg = orgs.First(a => a.Name == "testorgwithowner");
            Assert.Equal(user2.Id, newOrg.OwnerId);
        }

    }
}
