using System;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.EventDispatcher.EntityEventHandler;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Utility;
using OptimaJet.DWKit.StarterApplication.Utility.Extensions.EntityFramework;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.EventDispatcher.EntityHandler
{
    [Collection("WithoutAuthCollection")]
    public class ProjectHookHandlerTest : BaseTest<NoAuthStartup>
    {
        public ProjectHookHandlerTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }

        public User CurrentUser { get; set; }
        public ApplicationType type1 { get; set; }
        public Organization org1 { get; private set; }
        public Group group1 { get; set; }
        public Project project1 { get; set; }

        private void BuildTestData()
        {
            CurrentUser = NeedsCurrentUser();
            type1 = AddEntity<AppDbContext, ApplicationType>(new ApplicationType
            {
                Name = "scriptureappbuilder",
                Description = "Scripture App Builder"
            });

            org1 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg1",
                WebsiteUrl = "https://testorg1.org",
                BuildEngineUrl = "https://buildengine.testorg1",
                BuildEngineApiAccessToken = "replace",
                OwnerId = CurrentUser.Id

            });

            group1 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup1",
                Abbreviation = "TG1",
                OwnerId = org1.Id
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
                WorkflowProjectId = 1,
                WorkflowProjectUrl = "ssh://APKAJU5Y3VNN3GHK3LLQ@git-codecommit.us-east-1.amazonaws.com/v1/repos/scriptureappbuilder-DEM-LSDEV-eng-US-Test-Project8",
                IsPublic = true
            });
        }

        [Fact]
        public void Notify_Project_Insert()
        {
            BuildTestData();

            var handler = _fixture.GetService<IEntityHookHandler<Project, int>>();
            var hubContext = _fixture.GetService<IHubContext<JSONAPIHub>>();
            var mockHub = Mock.Get(hubContext);
            mockHub.Reset();
            var mockClients = Mock.Get<IHubClients>(hubContext.Clients);
            mockClients.Reset();

            handler.DidInsert(project1.StringId);

            // Verify that project status update sent
            mockHub.Verify(x => x.Clients.Group(It.IsAny<string>()), Times.Exactly(2));
            mockHub.Verify(x => x.Clients.Group(It.Is<string>(i => i == $"projects/{project1.Id.ToString()}")));
        }

        [Fact]
        public void Notify_Project_Update()
        {
            BuildTestData();

            var handler = _fixture.GetService<IEntityHookHandler<Project, int>>();
            var hubContext = _fixture.GetService<IHubContext<JSONAPIHub>>();
            var mockHub = Mock.Get(hubContext);
            mockHub.Reset();
            var mockClients = Mock.Get<IHubClients>(hubContext.Clients);
            mockClients.Reset();

            handler.DidUpdate(project1.StringId);

            // Verify that project status update sent
            mockHub.Verify(x => x.Clients.Group(It.IsAny<string>()), Times.Exactly(2));
            mockHub.Verify(x => x.Clients.Group(It.Is<string>(i => i == $"projects/{project1.Id.ToString()}")));
        }

        [Fact]
        public void Notify_Project_Delete()
        {
            BuildTestData();

            var handler = _fixture.GetService<IEntityHookHandler<Project, int>>();
            var hubContext = _fixture.GetService<IHubContext<JSONAPIHub>>();
            var mockHub = Mock.Get(hubContext);
            mockHub.Reset();
            var mockClients = Mock.Get<IHubClients>(hubContext.Clients);
            mockClients.Reset();

            handler.DidDelete(project1.StringId);

            // Verify that project status update sent
            mockHub.Verify(x => x.Clients.Group(It.IsAny<string>()), Times.Exactly(2));
            mockHub.Verify(x => x.Clients.Group(It.Is<string>(i => i == $"projects/{project1.Id.ToString()}")));
        }

    }
}
