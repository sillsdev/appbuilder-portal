using System;
using JsonApiDotNetCore.Data;
using Moq;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using SIL.AppBuilder.BuildEngineApiClient;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.BuildEngine
{
    [Collection("BuildEngineCollection")]
    public class BuildEngineSystemMonitorTests : BaseTest<BuildEngineStartup>
    {
        public User CurrentUser { get; set; }
        public User user1 { get; private set; }
        public Organization org1 { get; private set; }
        public Organization org2 { get; private set; }
        public Organization org3 { get; private set; }
        public Organization org4 { get; private set; }
        public SystemStatus sysstat1 { get; private set; }
        public SystemStatus sysstat2 { get; private set; }
        public BuildEngineSystemMonitorTests(TestFixture<BuildEngineStartup> fixture) : base(fixture)
        {
        }
        private void SetTestData()
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
                BuildEngineApiAccessToken = "5161678",
                OwnerId = CurrentUser.Id

            });
            org2 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg2",
                WebsiteUrl = "https://testorg2.org",
                BuildEngineUrl = "https://buildengine.testorg3",
                BuildEngineApiAccessToken = "5161678",
                OwnerId = CurrentUser.Id

            });
            org3 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg3",
                WebsiteUrl = "https://testorg3.org",
                BuildEngineUrl = "https://buildengine.testorg3",
                BuildEngineApiAccessToken = "5161678",
                OwnerId = CurrentUser.Id

            });
            org4 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg4",
                WebsiteUrl = "https://testorg3.org",
                BuildEngineUrl = "https://buildengine.testorg3",
                BuildEngineApiAccessToken = "4323864",
                OwnerId = CurrentUser.Id

            });
            sysstat1 = AddEntity<AppDbContext, SystemStatus>(new SystemStatus
            {
                BuildEngineUrl = "https://testorg3.org",
                BuildEngineApiAccessToken = "4323864"
            });
            sysstat2 = AddEntity<AppDbContext, SystemStatus>(new SystemStatus
            {
                BuildEngineUrl = "https://testorg4.org",
                BuildEngineApiAccessToken = "5161678"
            });
        }
        [Fact]
        public void MonitorSystem_Available()
        {
            SetTestData();

            var buildEngineService = _fixture.GetService<BuildEngineSystemMonitor>();
            var mockClient = Mock.Get(buildEngineService.BuildEngineApi);
            mockClient.Setup(x => x.SystemCheck()).Returns(System.Net.HttpStatusCode.OK);
            buildEngineService.CheckBuildEngineStatus();

            var systemStatuses = ReadTestData<AppDbContext, SystemStatus>();
            Assert.Equal(3, systemStatuses.Count);

            var systemStatus1 = systemStatuses[0];
            Assert.True(systemStatus1.SystemAvailable);
        }
        [Fact]
        public void MonitorSystem_Unavailable()
        {
            SetTestData();

            var buildEngineService = _fixture.GetService<BuildEngineSystemMonitor>();
            var mockClient = Mock.Get(buildEngineService.BuildEngineApi);
            mockClient.Setup(x => x.SystemCheck()).Returns(System.Net.HttpStatusCode.NotFound);
            buildEngineService.CheckBuildEngineStatus();

            var systemStatuses = ReadTestData<AppDbContext, SystemStatus>();
            Assert.Equal(3, systemStatuses.Count);

            var systemStatus1 = systemStatuses[0];
            Assert.False(systemStatus1.SystemAvailable);
        }
    }
}
