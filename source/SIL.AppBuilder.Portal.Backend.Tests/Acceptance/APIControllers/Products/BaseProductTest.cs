using System;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Products
{
    public class BaseProductTest : BaseTest<NoAuthStartup>
    {
        public BaseProductTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }

        public User CurrentUser { get; set; }
        public OrganizationMembership CurrentUserMembership { get; set; }
        public OrganizationMembership CurrentUserMembership2 { get; set; }
        public OrganizationMembership CurrentUserMembership3 { get; set; }
        public OrganizationMembership CurrentUserMembership4 { get; set; }
        public User user1 { get; private set; }
        public User user2 { get; private set; }
        public User user3 { get; private set; }
        public Organization org1 { get; private set; }
        public Organization org2 { get; private set; }
        public Organization org3 { get; private set; }
        public Organization org4 { get; set; }
        public Group group1 { get; set; }
        public Group group2 { get; set; }
        public Group group3 { get; set; }
        public Group group4 { get; set; }
        public Group group5 { get; set; }
        public GroupMembership groupMembership1 { get; set; }
        public GroupMembership groupMembership2 { get; set; }
        public ApplicationType type1 { get; set; }
        public Project project1 { get; set; }
        public Project project2 { get; set; }
        public Project project3 { get; set; }
        public Project project4 { get; set; }
        public Project project5 { get; set; }
        public Project project6 { get; set; }
        public WorkflowDefinition workflow1 { get; set; }
        public WorkflowDefinition workflow2 { get; set; }
        public ProductDefinition productDefinition1 { get; set; }
        public ProductDefinition productDefinition2 { get; set; }
        public ProductDefinition productDefinition3 { get; set; }
        public ProductDefinition productDefinition4 { get; set; }
        public OrganizationProductDefinition orgProduct1 { get; set; }
        public OrganizationProductDefinition orgProduct2 { get; set; }
        public OrganizationProductDefinition orgProduct3 { get; set; }
        public OrganizationProductDefinition orgProduct4 { get; set; }
        public Product product1 { get; set; }
        public Product product2 { get; set; }
        public Product product3 { get; set; }
        public Product product4 { get; set; }
        public StoreType storeType1 { get; set; }
        public StoreType storeType2 { get; set; }
        public Store store1 { get; set; }
        public Store store2 { get; set; }
        public StoreLanguage storeLang1 { get; set; }
        public StoreLanguage storeLang2 { get; set; }
        public OrganizationStore orgStore1 { get; set; }
        protected void BuildTestData()
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
            storeType1 = AddEntity<AppDbContext, StoreType>(new StoreType
            {
                Name = "google_play_store",
                Description = "Google Play Store"
            });
            storeType2 = AddEntity<AppDbContext, StoreType>(new StoreType
            {
                Name = "ios_app_store",
                Description = "IOS App Store"
            });
            storeLang1 = AddEntity<AppDbContext, StoreLanguage>(new StoreLanguage
            {
                Name = "en-US",
                Description = "US English",
                StoreTypeId = storeType1.Id
            });
            storeLang2 = AddEntity<AppDbContext, StoreLanguage>(new StoreLanguage
            {
                Name = "en-GB",
                Description = "United Kingdom English",
                StoreTypeId = storeType1.Id
            });
            store1 = AddEntity<AppDbContext, Store>(new Store
            {
                Name = "wycliffeusa",
                Description = "Wycliffe USA - Google Play Store",
                StoreTypeId = storeType1.Id
            });
            store2 = AddEntity<AppDbContext, Store>(new Store
            {
                Name = "wycliffeusa",
                Description = "Wycliffe USA - IOS Play Store",
                StoreTypeId = storeType2.Id
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
            org4 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg4",
                WebsiteUrl = "https://testorg4.org",
                BuildEngineUrl = "https://buildengine.testorg1",
                BuildEngineApiAccessToken = "replace",
                OwnerId = CurrentUser.Id

            });
            orgStore1 = AddEntity<AppDbContext, OrganizationStore>(new OrganizationStore
            {
                OrganizationId = org4.Id,
                StoreId = store1.Id
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
            CurrentUserMembership3 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = CurrentUser.Id,
                OrganizationId = org4.Id
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
            group5 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup5",
                Abbreviation = "TG5",
                OwnerId = org4.Id
            });
            groupMembership1 = AddEntity<AppDbContext, GroupMembership>(new GroupMembership
            {
                UserId = CurrentUser.Id,
                GroupId = group1.Id
            });
            groupMembership2 = AddEntity<AppDbContext, GroupMembership>(new GroupMembership
            {
                UserId = CurrentUser.Id,
                GroupId = group5.Id
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
                IsPublic = true
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
                IsPublic = true
            });
            project3 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project3",
                TypeId = type1.Id,
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group3.Id,
                OrganizationId = org2.Id,
                Language = "eng-US",
                IsPublic = true
            });
            project4 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project4",
                TypeId = type1.Id,
                Description = "Test Description",
                OwnerId = user1.Id,
                GroupId = group4.Id,
                OrganizationId = org3.Id,
                Language = "eng-US",
                IsPublic = true
            });
            project5 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project5",
                TypeId = type1.Id,
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group5.Id,
                OrganizationId = org4.Id,
                Language = "eng-US",
                IsPublic = true
            });
            project6 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project6",
                TypeId = type1.Id,
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group5.Id,
                OrganizationId = org4.Id,
                Language = "eng-GB",
                IsPublic = true
            });

            workflow1 = AddEntity<AppDbContext, WorkflowDefinition>(new WorkflowDefinition
            {
                Name = "TestWorkFlow",
                Enabled = true,
                Description = "This is a test workflow",
                WorkflowScheme = "Don't know what this is"
            });
            workflow2 = AddEntity<AppDbContext, WorkflowDefinition>(new WorkflowDefinition
            {
                Name = "TestWorkFlow2",
                Enabled = true,
                Description = "This is a test workflow",
                WorkflowScheme = "Don't know what this is",
                StoreTypeId = storeType1.Id
            });
            productDefinition1 = AddEntity<AppDbContext, ProductDefinition>(new ProductDefinition
            {
                Name = "TestProd1",
                TypeId = type1.Id,
                Description = "This is a test product",
                WorkflowId = workflow1.Id
            });
            productDefinition2 = AddEntity<AppDbContext, ProductDefinition>(new ProductDefinition
            {
                Name = "TestProd2",
                TypeId = type1.Id,
                Description = "This is test product 2",
                WorkflowId = workflow1.Id

            });
            productDefinition3 = AddEntity<AppDbContext, ProductDefinition>(new ProductDefinition
            {
                Name = "TestProd3",
                TypeId = type1.Id,
                Description = "This is test product 3",
                WorkflowId = workflow1.Id

            });
            productDefinition4 = AddEntity<AppDbContext, ProductDefinition>(new ProductDefinition
            {
                Name = "TestProd4",
                TypeId = type1.Id,
                Description = "This is a test product",
                WorkflowId = workflow2.Id
            });

            orgProduct1 = AddEntity<AppDbContext, OrganizationProductDefinition>(new OrganizationProductDefinition
            {
                OrganizationId = org1.Id,
                ProductDefinitionId = productDefinition1.Id
            });
            orgProduct2 = AddEntity<AppDbContext, OrganizationProductDefinition>(new OrganizationProductDefinition
            {
                OrganizationId = org2.Id,
                ProductDefinitionId = productDefinition2.Id
            });
            orgProduct3 = AddEntity<AppDbContext, OrganizationProductDefinition>(new OrganizationProductDefinition
            {
                OrganizationId = org3.Id,
                ProductDefinitionId = productDefinition3.Id
            });
            orgProduct4 = AddEntity<AppDbContext, OrganizationProductDefinition>(new OrganizationProductDefinition
            {
                OrganizationId = org4.Id,
                ProductDefinitionId = productDefinition4.Id
            });
            product1 = AddEntity<AppDbContext, Product>(new Product
            {
                ProjectId = project1.Id,
                ProductDefinitionId = productDefinition1.Id
            });
            product2 = AddEntity<AppDbContext, Product>(new Product
            {
                ProjectId = project4.Id,
                ProductDefinitionId = productDefinition3.Id
            });
            product3 = AddEntity<AppDbContext, Product>(new Product
            {
                ProjectId = project3.Id,
                ProductDefinitionId = productDefinition2.Id
            });
            product4 = AddEntity<AppDbContext, Product>(new Product
            {
                ProjectId = project5.Id,
                ProductDefinitionId = productDefinition4.Id,
                StoreId = store1.Id,
                StoreLanguageId = storeLang1.Id
            });

        }

    }
}
