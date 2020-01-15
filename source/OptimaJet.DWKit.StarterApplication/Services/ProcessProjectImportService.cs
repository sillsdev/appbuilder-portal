using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bugsnag;
using Hangfire;
using I18Next.Net.Plugins;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using OptimaJet.DWKit.StarterApplication.Services.Workflow;
using OptimaJet.DWKit.StarterApplication.Utility;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class ImportProject
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Language { get; set; }
        public bool IsPublic { get; set; }
        public bool AllowDownloads { get; set; }
        public bool AutomaticBuilds { get; set; }
    }
    public class ImportProduct
    {
        public string Name { get; set; }
        public string Store { get; set; }
    }

    public class ImportData
    {
        public List<ImportProject> Projects { get; set; }
        public List<ImportProduct> Products { get; set; }
    }

    public class ProcessProjectImportService : IProcessProjectImportService
    {
        private readonly ITranslator translator;
        protected readonly IJobRepository<ProjectImport> projectImportRepository;
        private readonly IClient bugsnagClient;
        private readonly IBackgroundJobClient hangfireClient;
        protected readonly IJobRepository<Email> emailRepository;
        private readonly IJobRepository<Project> projectRepository;
        private readonly IJobRepository<Product,Guid> productRepository;
        private readonly IJobRepository<ProductDefinition> productDefinitionRepository;
        private readonly IJobRepository<Store> storeRepository;

        public ProcessProjectImportService(
            ITranslator translator,
            IJobRepository<ProjectImport> projectImportRepository,
            IClient bugsnagClient,
            IBackgroundJobClient hangfireClient,
            IJobRepository<Email> emailRepository,
            IJobRepository<Project> projectRepository,
            IJobRepository<Product,Guid> productRepository,
            IJobRepository<ProductDefinition> productDefinitionRepository,
            IJobRepository<Store> storeRepository)
        {
            this.translator = translator;
            this.projectImportRepository = projectImportRepository;
            this.bugsnagClient = bugsnagClient;
            this.hangfireClient = hangfireClient;
            this.emailRepository = emailRepository;
            this.projectRepository = projectRepository;
            this.productRepository = productRepository;
            this.productDefinitionRepository = productDefinitionRepository;
            this.storeRepository = storeRepository;
        }

        public void Process(ProcessProjectImportServiceData data)
        {
            ProcessImportData(data.Id).Wait();
        }

        public async Task ProcessImportData(int id)
        {
            var projectImport = await projectImportRepository.Get()
                .Where(pi => pi.Id == id)
                .Include(pi => pi.Organization)
                .Include(pi => pi.Owner)
                .Include(pi => pi.Group)
                .Include(pi => pi.Type)
                .FirstOrDefaultAsync();
            if (projectImport == null)
            {
                // Creating an Exception to report to BugSnag.  Don't want to Retry.
                var ex = new Exception($"ImportData id={id}: not found");
                Log.Error(ex, "ProcessImportData: id not found");
                bugsnagClient.Notify(ex);
                return;
            }

            var locale = projectImport.Owner.LocaleOrDefault();
            var report = new List<string>();

            var importData = JsonConvert.DeserializeObject<ImportData>(projectImport.ImportData);
            var importedProjects = new List<Project>();
            foreach (var importProject in importData.Projects)
            {
                var project = await projectRepository.Get()
                    .Where(p => p.Name == importProject.Name)
                    .Include(p => p.Products)
                    .FirstOrDefaultAsync();
                if (project == null)
                {
                    // expected
                    project = new Project
                    {
                        OwnerId = projectImport.OwnerId.Value,
                        OrganizationId = projectImport.OrganizationId.Value,
                        GroupId = projectImport.GroupId.Value,
                        TypeId = projectImport.TypeId.Value,
                        ImportId = id,
                        Name = importProject.Name,
                        Description = importProject.Description,
                        Language = importProject.Language,
                        IsPublic = importProject.IsPublic,
                        AllowDownloads = importProject.AllowDownloads,
                        AutomaticBuilds = importProject.AutomaticBuilds,

                    };
                    var newProject = await projectRepository.CreateAsync(project);
                    hangfireClient.Enqueue<BuildEngineProjectService>(service => service.ManageProject(newProject.Id, null));

                    importedProjects.Add(newProject);
                    await AddReportLine(report, locale, "newProject", new Dictionary<string, object>()
                    {
                        ["projectId"] = newProject.Id,
                        ["projectName"] = newProject.Name,
                    });
                }
                else if (project.ImportId == id)
                {
                    importedProjects.Add(project);
                }
                else
                {
                    await AddReportLine(report, locale, "existingProject", new Dictionary<string, object>()
                    {
                        ["projectId"] = project.Id,
                        ["projectName"] = project.Name,
                    });
                    Log.Information("Project already exists", project);
                }
            }

            foreach (var project in importedProjects)
            {
                foreach (var importProduct in importData.Products)
                {
                    var productDefinition = await productDefinitionRepository.Get()
                        .Where(pd => pd.Name == importProduct.Name)
                        .FirstOrDefaultAsync();
                    if (productDefinition == null)
                    {
                        Log.Error($"Product not found: {importProduct.Name}");
                        continue;
                    }

                    var store = await storeRepository.Get()
                        .Where(s => s.Name == importProduct.Store)
                        .FirstOrDefaultAsync();
                    if (store == null)
                    {
                        Log.Error($"Store not found: {importProduct.Store}");
                        continue;
                    }

                    // OrganizationProductDefintion and OrganizationStore have
                    // already been checked. So just create the product.

                    // See if we have already created it (in case this long
                    // running process was halted for some reason.
                    var product = await productRepository.Get()
                        .Where(p => p.ProjectId == project.Id &&
                                    p.ProductDefinitionId == productDefinition.Id &&
                                    p.StoreId == store.Id)
                        .FirstOrDefaultAsync();
                    if (product == null)
                    {
                        // expected
                        product = new Product
                        {
                            ProjectId = project.Id,
                            ProductDefinitionId = productDefinition.Id,
                            StoreId = store.Id
                        };
                        var newProduct = await productRepository.CreateAsync(product);
                        hangfireClient.Enqueue<WorkflowProductService>(service => service.ManageNewProduct(product.Id));
                        await AddReportLine(report, locale, "newProduct", new Dictionary<string, object>()
                        {
                            ["projectId"] = newProduct.ProjectId,
                            ["productDefinitionName"] = productDefinition.Name,
                            ["storeName"] = store.Name,
                            ["storeId"] = store.Id
                        });
                    }
                    else
                    {
                        await AddReportLine(report, locale, "existingProduct", new Dictionary<string, object>()
                        {
                            ["projectId"] = project.Id,
                            ["productDefinitionName"] = productDefinition.Name,
                            ["storeName"] = store.Name,
                            ["storeId"] = store.Id
                        });
                        Log.Information("Product already exists", product);
                    }
                }
            }

            await SendReportEmail(projectImport, report);
        }

        private async Task AddReportLine(List<string> report, string language, string key, Dictionary<string, object> args)
        {
            string line = await translator.TranslateAsync(language, "importProject", $"importProject.{key}", args);
            report.Add(line);
        }

        private async Task TranslateProperty(List<string> properties, string language, string name, string value)
        {
            string propertyName = await translator.TranslateAsync(language, "importProject", $"importProject.{name}", null);
            string property = await translator.TranslateAsync(language, "importProject", "importProject.property", new Dictionary<string, object>()
            {
                ["name"] = propertyName,
                ["value"] = value
            });
            properties.Add(property); 
        }

        private async Task SendReportEmail(ProjectImport projectImport, List<string> outputLines)
        {
            var locale = projectImport.Owner.LocaleOrDefault();
            string subject = await translator.TranslateAsync(locale, "importProject", "importProject.subject", null);
            string title = await translator.TranslateAsync(locale, "importProject", "importProject.title", null);
            string propertiesHeader = await translator.TranslateAsync(locale, "importProject", "importProject.propertiesHeader", null);
            string outputHeader = await translator.TranslateAsync(locale, "importProject", "importProject.outputHeader", null);

            var propertyLines = new List<string>();
            await TranslateProperty(propertyLines, locale, "Owner", projectImport.Owner.Name);
            await TranslateProperty(propertyLines, locale, "Group", projectImport.Group.Name);
            await TranslateProperty(propertyLines, locale, "Organization", projectImport.Organization.Name);
            await TranslateProperty(propertyLines, locale, "Application Type", projectImport.Type.Description);

            var email = new Email
            {
                To = projectImport.Owner.Email,
                Subject = subject,
                ContentTemplate = "ProjectImport.txt",
                ContentModel = new
                {
                    Title = title,
                    PropertiesHeader = propertiesHeader,
                    Properties = propertyLines,
                    OutputHeader = outputHeader,
                    Output = outputLines
                }
            };
            await emailRepository.CreateAsync(email);
        }
    }
}
