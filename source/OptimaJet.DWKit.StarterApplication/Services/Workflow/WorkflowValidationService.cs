using System;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services.Workflow
{
    public class WorkflowValidationService
    {
        public WorkflowValidationService(
            IServiceProvider serviceProvider,
            IDbContextResolver contextResolver,
            IJobRepository<ProductWorkflowScheme, Guid> productWorkflowSchemeRepository
            )
        {
            ServiceProvider = serviceProvider;
            ProductWorkflowSchemeRepository = productWorkflowSchemeRepository;
            this.dbContext = contextResolver.GetContext();
            this.dbSet = contextResolver.GetDbSet<WorkflowScheme>();
        }

        protected readonly DbSet<WorkflowScheme> dbSet;
        protected readonly DbContext dbContext;

        public IServiceProvider ServiceProvider { get; }
        public IJobRepository<ProductWorkflowScheme, Guid> ProductWorkflowSchemeRepository { get; }

        public void validateWorkflows()
        {
            checkForObsoleteSchemas().Wait();
        }
        public async Task checkForObsoleteSchemas()
        {
            // Have to use DbSet directly because the WorkflowScheme table has no Id field
            var workflowSchemes = await dbSet.ToListAsync();
            var workflowSchemeInstances = await ProductWorkflowSchemeRepository.GetListAsync();
            foreach (ProductWorkflowScheme workflowSchemeInstance in workflowSchemeInstances)
            {
                if (!workflowSchemeInstance.IsObsolete)
                {
                    var obsolete = false;
                    try
                    {
                        WorkflowScheme workflowSchemeTemplate = workflowSchemes.Single(s => s.Code == workflowSchemeInstance.SchemeCode);
                        int instanceEndOfProcess = workflowSchemeInstance.Scheme.IndexOf(">", StringComparison.Ordinal);
                        int templateEndOfProcess = workflowSchemeTemplate.Scheme.IndexOf(">", StringComparison.Ordinal);
                        string instanceSubstring = workflowSchemeInstance.Scheme.Substring(instanceEndOfProcess);
                        string templateSubstring = workflowSchemeTemplate.Scheme.Substring(templateEndOfProcess);
                        if (!templateSubstring.Equals(instanceSubstring))
                        {
                            obsolete = true;
                        }
                    }
                    catch (Exception)
                    {
                        // Should catch exception if there was no matching template
                        Log.Information($"No template for workflow {workflowSchemeInstance.SchemeCode}");
                        obsolete = true;
                    }

                    if (obsolete)
                    {
                        await obsoleteWorkflowSchemeInstance(workflowSchemeInstance.Id);
                    }
                }
            }
        }
        private async Task obsoleteWorkflowSchemeInstance(Guid instanceId)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var workflowScheme = this.ProductWorkflowSchemeRepository.Get()
                    .Where(p => p.Id == instanceId)
                    .FirstOrDefaultAsync().Result;
                if (workflowScheme != null)
                {
                    workflowScheme.IsObsolete = true;
                    await ProductWorkflowSchemeRepository.UpdateAsync(workflowScheme);
                    Log.Information($"Product Workflow Obsolete: {workflowScheme.Id}");
                }
            }
        }
    }
}
