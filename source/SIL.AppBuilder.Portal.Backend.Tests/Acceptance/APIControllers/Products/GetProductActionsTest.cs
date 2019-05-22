using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Hangfire;
using Hangfire.Common;
using Hangfire.States;
using Moq;
using Newtonsoft.Json;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services.Workflow;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Products
{
    [Collection("WithoutAuthCollection")]
    public class GetProductActionsTest : BaseTest<NoAuthStartup>
    {
        public GetProductActionsTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }

        public User CurrentUser { get; private set; }
        public User user1 { get; private set; }
        public Group group1 { get; private set; }
        public GroupMembership groupMembership1 { get; private set; }
        public Organization org1 { get; private set; }
        public ApplicationType type1 { get; private set; }
        public Project project1 { get; private set; }
        public Project project2 { get; private set; }
        public Project project3 { get; private set; }
        public Project project4 { get; private set; }
        public Project project5 { get; private set; }
        public WorkflowDefinition workflowStartup { get; private set; }
        public WorkflowDefinition workflowRebuild { get; private set; }
        public WorkflowDefinition workflowRepublish { get; private set; }
        public ProductDefinition productDefinition1 { get; private set; }
        public ProductDefinition productDefinition2 { get; private set; }
        public OrganizationProductDefinition orgProduct1 { get; private set; }
        public Product product1 { get; private set; }
        public Product product2 { get; private set; }
        public Product product3 { get; private set; }
        public Product product4 { get; private set; }
        public Product product5 { get; private set; }
        public ProductWorkflowScheme productWorkflowScheme3 { get; private set; }
        public ProductWorkflow productWorkflow3 { get; private set; }
        public ProductWorkflowScheme productWorkflowScheme4 { get; private set; }
        public ProductWorkflow productWorkflow4 { get; private set; }

        protected void BuildTestDataForProductActions()
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
                OwnerId = user1.Id
            });

            group1 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup1",
                Abbreviation = "TG1",
                OwnerId = org1.Id
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
                IsPublic = true,
                WorkflowProjectUrl = "www.workflow.url"
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
                IsPublic = true,
                WorkflowProjectUrl = "www.workflow.url"
            });
            project3 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project3",
                TypeId = type1.Id,
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "eng-US",
                IsPublic = true,
                WorkflowProjectUrl = "www.workflow.url"
            });
            project4 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project4",
                TypeId = type1.Id,
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "eng-US",
                IsPublic = true,
                WorkflowProjectUrl = "www.workflow.url"
            });
            project5 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project5",
                TypeId = type1.Id,
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "eng-US",
                IsPublic = true,
                WorkflowProjectUrl = "www.workflow.url"
            });

            workflowStartup = AddEntity<AppDbContext, WorkflowDefinition>(new WorkflowDefinition
            {
                Name = "MainWorkflow",
                Enabled = true,
                Description = "This is a test workflow",
                WorkflowScheme = "SIL_Default_AppBuilders_Android_GooglePlay",
                Type = WorkflowType.Startup
            });
            workflowRebuild = AddEntity<AppDbContext, WorkflowDefinition>(new WorkflowDefinition
            {
                Name = "RebuildWorkflow",
                Enabled = true,
                Description = "This is a test workflow",
                WorkflowScheme = "SIL_Default_AppBuilders_Android_GooglePlay_Rebuild",
                Type = WorkflowType.Rebuild
            });
            workflowRepublish = AddEntity<AppDbContext, WorkflowDefinition>(new WorkflowDefinition
            {
                Name = "RepublishWorkflow",
                Enabled = true,
                Description = "This is a test workflow",
                WorkflowScheme = "SIL_Default_AppBuilders_Android_GooglePlay_Republish",
                Type = WorkflowType.Republish
            });
            productDefinition1 = AddEntity<AppDbContext, ProductDefinition>(new ProductDefinition
            {
                Name = "TestProd1",
                TypeId = type1.Id,
                Description = "This is a test product",
                WorkflowId = workflowStartup.Id,
                RebuildWorkflowId = workflowRebuild.Id,
                RepublishWorkflowId = workflowRepublish.Id
            });
            productDefinition2 = AddEntity<AppDbContext, ProductDefinition>(new ProductDefinition
            {
                Name = "TestProd2",
                TypeId = type1.Id,
                Description = "This is a test product",
                WorkflowId = workflowStartup.Id,
                RebuildWorkflowId = workflowRebuild.Id
            });
            orgProduct1 = AddEntity<AppDbContext, OrganizationProductDefinition>(new OrganizationProductDefinition
            {
                OrganizationId = org1.Id,
                ProductDefinitionId = productDefinition1.Id
            });
            product1 = AddEntity<AppDbContext, Product>(new Product
            {
                ProjectId = project1.Id,
                ProductDefinitionId = productDefinition1.Id
            });
            product2 = AddEntity<AppDbContext, Product>(new Product
            {
                ProjectId = project2.Id,
                ProductDefinitionId = productDefinition1.Id,
                DatePublished = DateTime.Now
            });
            product3 = AddEntity<AppDbContext, Product>(new Product
            {
                ProjectId = project3.Id,
                ProductDefinitionId = productDefinition1.Id
            });
            product4 = AddEntity<AppDbContext, Product>(new Product
            {
                ProjectId = project4.Id,
                ProductDefinitionId = productDefinition1.Id,
                DatePublished = DateTime.Now
            });
            product5 = AddEntity<AppDbContext, Product>(new Product
            {
                ProjectId = project5.Id,
                ProductDefinitionId = productDefinition2.Id,
                DatePublished = DateTime.Now
            });

            productWorkflowScheme3 = AddEntity<AppDbContext, ProductWorkflowScheme>(new ProductWorkflowScheme
            {
                Id = Guid.NewGuid(),
                SchemeCode = workflowStartup.WorkflowScheme
            });
            productWorkflow3 = AddEntity<AppDbContext, ProductWorkflow>(new ProductWorkflow
            {
                Id = product3.Id,
                ActivityName = "Approval",
                SchemeId = productWorkflowScheme3.Id,
                StateName = "Approval"
            });
            productWorkflowScheme4 = AddEntity<AppDbContext, ProductWorkflowScheme>(new ProductWorkflowScheme
            {
                Id = Guid.NewGuid(),
                SchemeCode = workflowRebuild.WorkflowScheme
            });
            productWorkflow4 = AddEntity<AppDbContext, ProductWorkflow>(new ProductWorkflow
            {
                Id = product4.Id,
                ActivityName = "Verify and Publish",
                SchemeId = productWorkflowScheme4.Id,
                StateName = "Verify and Publish"
            });

        }

        [Fact]
        public async Task Get_ProductActions_NoWorkflow_NotPublished()
        {
            BuildTestDataForProductActions();

            var url = $"/api/products/{product1.Id}/actions";
            var response = await Get(url, org1.ToString());

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            //var productActions = await Deserialize<ProductActions>(response);
            //Assert.Equal(product1.Id, productActions.Id);
        }

        [Fact]
        public async Task Get_ProductActions_NoWorkflow_Published()
        {
            BuildTestDataForProductActions();
 
            var url = $"/api/products/{product2.Id}/actions";
            var response = await Get(url, org1.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var productActions = await Deserialize<ProductActions>(response);
            Assert.Equal(product2.Id, productActions.Id);
            Assert.Equal(2, productActions.Actions.Count());
        }


        [Fact]
        public async Task Get_ProductActions_Workflow_NotPublished()
        {
            BuildTestDataForProductActions();


            var url = $"/api/products/{product3.Id}/actions";
            var response = await Get(url, org1.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var productActions = await Deserialize<ProductActions>(response);
            Assert.Equal(product3.Id, productActions.Id);
            Assert.Empty(productActions.Actions);
        }

        [Fact]
        public async Task Get_ProductActions_Workflow_Published()
        {
            BuildTestDataForProductActions();


            var url = $"/api/products/{product4.Id}/actions";
            var response = await Get(url, org1.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var productActions = await Deserialize<ProductActions>(response);
            Assert.Equal(product4.Id, productActions.Id);
            Assert.Single(productActions.Actions);
            Assert.Equal("Cancel", productActions.Actions.First());
        }

        [Fact(Skip = null /* "Not Working: BadRequest (Accept Header)"*/)]
        public async Task Get_ProductActions_For_Projects_FromPost()
        {
            BuildTestDataForProductActions();

            var url = $"/api/product-actions";
            //var content = $"{{\"data\":{{\"attributes\":{{\"projects\":[ {project1.Id}, {project2.Id} ]}},\"type\":\"product-action-projects\",\"id\":\"1A2A639E-2F95-48D4-84FF-F6A2A90D5594\"}}}}";
            var content = $"{{\"projects\":[ {project1.Id}, {project2.Id} ] ,\"id\":\"1A2A639E-2F95-48D4-84FF-F6A2A90D5594\"}}";
            var response = await Post(url, content, org1.ToString(), contentType:"application/json");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<Dictionary<string, List<string>>>(body);
            Assert.Equal(2, result.Count);
            Assert.Single(result.First().Value);
            Assert.Single(result.Last().Value);
        }

        [Fact]
        public async Task Run_ProductActions_For_Projects_Start_Workflow()
        {
            BuildTestDataForProductActions();

            var backgroundJobClient = _fixture.GetService<IBackgroundJobClient>();
            var backgroundJobClientMock = Mock.Get(backgroundJobClient);

            var url = "/api/product-actions/run";
            //var content = $"{{\"data\":{{\"attributes\":{{\"action\":\"Rebuild\",\"products\":[\"{product2.Id}\"]}},\"type\":\"product-action-runs\",\"id\":\"2A2A639E-2F95-48D4-84FF-F6A2A90D5594\"}}}}";
            var content = $"{{ \"action\" : \"Rebuild\", \"products\" :[\"{product2.Id}\"] ,\"id\":\"2A2A639E-2F95-48D4-84FF-F6A2A90D5594\"}}";
            var response = await Post(url, content, contentType:"application/json");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            backgroundJobClientMock.Verify(x => x.Create(
                It.Is<Job>(job =>
                           job.Method.Name == "StartProductWorkflow" &&
                           job.Type == typeof(WorkflowProductService)),
                It.IsAny<EnqueuedState>()));
        }

        [Fact]
        public async Task Run_ProductActions_For_Projects_Error_Not_Published()
        {
            BuildTestDataForProductActions();

            var backgroundJobClient = _fixture.GetService<IBackgroundJobClient>();
            var backgroundJobClientMock = Mock.Get(backgroundJobClient);

            var url = "/api/product-actions/run";
            //var content = $"{{\"data\":{{\"attributes\":{{\"action\":\"Rebuild\",\"products\":[\"{product1.Id}\",\"{product2.Id}\"]}},\"type\":\"product-action-runs\",\"id\":\"3A2A639E-2F95-48D4-84FF-F6A2A90D5594\"}}}}";
            var content = $"{{\"action\":\"Rebuild\",\"products\":[\"{product1.Id}\",\"{product2.Id}\"] ,\"id\":\"3A2A639E-2F95-48D4-84FF-F6A2A90D5594\"}}";
            var response = await Post(url, content, contentType:"application/json");
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            var responseBody = await response.Content.ReadAsStringAsync();
            Assert.Contains("not published", responseBody);
         }

        [Fact]
        public async Task Run_ProductActions_For_Projects_Error_No_Workflow_Defined()
        {
            BuildTestDataForProductActions();

            var backgroundJobClient = _fixture.GetService<IBackgroundJobClient>();
            var backgroundJobClientMock = Mock.Get(backgroundJobClient);

            var url = "/api/product-actions/run";
            //var content = $"{{\"data\":{{\"attributes\":{{\"action\":\"Republish\",\"products\":[\"{product5.Id}\"]}},\"type\":\"product-action-runs\",\"id\":\"4A2A639E-2F95-48D4-84FF-F6A2A90D5594\"}}}}";
            var content = $"{{\"action\":\"Republish\",\"products\":[\"{product5.Id}\"],\"id\":\"4A2A639E-2F95-48D4-84FF-F6A2A90D5594\"}}";
            var response = await Post(url, content, contentType:"application/json");
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            var responseBody = await response.Content.ReadAsStringAsync();
            Assert.Contains("no workflow defined", responseBody);
        }

    }
}
