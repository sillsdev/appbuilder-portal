using System;
using System.Linq;
using Hangfire;
using I18Next.Net.Plugins;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Utility;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class ProjectImportService : IProjectImportService
    {
        private readonly ITranslator translator;
        protected readonly IJobRepository<ProjectImport> projectImportRepository;
        protected readonly IJobRepository<Email> emailRepository;
        private readonly IJobRepository<UserRole> userRolesRepository;
        public ProjectImportService(
            ITranslator translator,
            IOptions<OrganizationInviteRequestSettings> options,
            IJobRepository<ProjectImport> projectImportRepository,
            IJobRepository<Email> emailRepository,
            IJobRepository<UserRole> userRolesRepository)
        {
            this.translator = translator;
            this.projectImportRepository = projectImportRepository;
            this.emailRepository = emailRepository;
            this.userRolesRepository = userRolesRepository;
        }

        public void Process(ProjectImportServiceData data)
        {
            var projectImport = projectImportRepository.GetAsync(data.Id).Result;

            var projects = JsonUtils.DeserializeProperties(projectImport.ImportData);

        }
    }
}
