﻿using System;
using JsonApiDotNetCore.Data;
using Hangfire;
using Job = Hangfire.Common.Job;
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
        public Role roleOA { get; set; }
        public UserRole ur1 { get; set; }
        public UserRole ur2 { get; set; }
        public UserRole ur3 { get; set; }
        public UserRole ur4 { get; set; }
        public String DefaultBuildEngineUrl { get; set; }
        public String DefaultBuildEngineApiAccessToken { get; set; }

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
            roleOA = AddEntity<AppDbContext, Role>(new Role
            {
                RoleName = RoleName.OrganizationAdmin
            });
            org1 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg1",
                WebsiteUrl = "https://testorg1.org",
                BuildEngineUrl = "https://buildengine.testorg1",
                BuildEngineApiAccessToken = "5161678",
                UseDefaultBuildEngine = false,
                OwnerId = CurrentUser.Id

            });
            org2 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg2",
                WebsiteUrl = "https://testorg2.org",
                BuildEngineUrl = "https://buildengine.testorg3",
                BuildEngineApiAccessToken = "5161678",
                UseDefaultBuildEngine = false,
                OwnerId = CurrentUser.Id

            });
            org3 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg3",
                WebsiteUrl = "https://testorg3.org",
                BuildEngineUrl = "https://buildengine.testorg3",
                BuildEngineApiAccessToken = "5161678",
                UseDefaultBuildEngine = false,
                OwnerId = CurrentUser.Id

            });
            org4 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg4",
                WebsiteUrl = "https://testorg3.org",
                BuildEngineUrl = "https://buildengine.testorg3",
                BuildEngineApiAccessToken = "4323864",
                UseDefaultBuildEngine = null, // null should be considered false
                OwnerId = CurrentUser.Id

            });
            ur1 = AddEntity<AppDbContext, UserRole>(new UserRole
            {
                UserId = CurrentUser.Id,
                RoleId = roleOA.Id,
                OrganizationId = org1.Id
            });
            ur2 = AddEntity<AppDbContext, UserRole>(new UserRole
            {
                UserId = CurrentUser.Id,
                RoleId = roleOA.Id,
                OrganizationId = org2.Id
            });
            ur3 = AddEntity<AppDbContext, UserRole>(new UserRole
            {
                UserId = CurrentUser.Id,
                RoleId = roleOA.Id,
                OrganizationId = org3.Id
            });
            ur4 = AddEntity<AppDbContext, UserRole>(new UserRole
            {
                UserId = CurrentUser.Id,
                RoleId = roleOA.Id,
                OrganizationId = org4.Id
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
            DefaultBuildEngineUrl = "https://default-buildengine:8443";
            DefaultBuildEngineApiAccessToken = "default_token";
            Environment.SetEnvironmentVariable("DEFAULT_BUILDENGINE_URL", DefaultBuildEngineUrl);
            Environment.SetEnvironmentVariable("DEFAULT_BUILDENGINE_API_ACCESS_TOKEN", DefaultBuildEngineApiAccessToken);
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
            Assert.Equal(4, systemStatuses.Count);

            var systemStatus1 = systemStatuses[0];
            Assert.True(systemStatus1.SystemAvailable);
        }
        [Fact]
        public void MonitorSystem_Unavailable()
        {
            SetTestData();
            var recurringJobManager = _fixture.GetService<IRecurringJobManager>();
            var recurringJobManagerMock = Mock.Get(recurringJobManager);
            recurringJobManagerMock.Reset();

            var systat3 = AddEntity<AppDbContext, SystemStatus>(new SystemStatus
            {
                BuildEngineUrl = "https://buildengine.testorg1",
                BuildEngineApiAccessToken = "5161678",
                SystemAvailable = true
            });

            var buildEngineService = _fixture.GetService<BuildEngineSystemMonitor>();
            var mockClient = Mock.Get(buildEngineService.BuildEngineApi);
            mockClient.Setup(x => x.SystemCheck()).Returns(System.Net.HttpStatusCode.NotFound);
            buildEngineService.CheckBuildEngineStatus();

            var systemStatuses = ReadTestData<AppDbContext, SystemStatus>();
            Assert.Equal(4, systemStatuses.Count);

            var systemStatus1 = systemStatuses[0];
            Assert.False(systemStatus1.SystemAvailable);

            // A single recurring task is created for the entry that changed from enabled to disabled
            recurringJobManagerMock.Verify(x => x.AddOrUpdate(It.IsAny<String>(), It.IsAny<Job>(), It.IsAny<String>(), It.IsAny<RecurringJobOptions>()), Times.Exactly(1));

        }
    }
}
