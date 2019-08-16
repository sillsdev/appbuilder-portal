using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire.Server;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.Application;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Model;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.Workflow.Core.Runtime;
using Serilog;
using static OptimaJet.DWKit.StarterApplication.Services.Workflow.WorkflowProductService;

namespace OptimaJet.DWKit.StarterApplication.Services.Workflow
{
    public class WorkflowProjectService
    {

        public IJobRepository<Project> ProjectRepository { get; }
        public WorkflowProductService WorkflowProductService { get; }

        public WorkflowProjectService(
            IJobRepository<Project> projectRepository,
            WorkflowProductService productService
        )
        {
            this.ProjectRepository = projectRepository;
            this.WorkflowProductService = productService;
        }

        public async Task ReassignUserTasks(int projectId) {
            var project = this.ProjectRepository.Get()
                .Include(proj => proj.Products)
                    .ThenInclude(prod => prod.Project)
                        .ThenInclude(proj => proj.Owner)
                .Include(proj => proj.Products)
                    .ThenInclude(prod => prod.ProductDefinition)
                .Where(p => p.Id == projectId)
                .FirstOrDefaultAsync().Result;

            foreach (var product in project.Products) {
                await this.WorkflowProductService.ReassignUserTasksForProduct(product);
            }
        }

        public void UpdateProjectActive(int projectId)
        {
            UpdateProjectActiveAsync(projectId).Wait();
        }

        public async Task UpdateProjectActiveAsync(int projectId)
        {
            var project = await this.ProjectRepository.Get()
                .Where(p => p.Id == projectId)
                .Include(p => p.Products)
                    .ThenInclude(prod => prod.ProductWorkflow)
                .FirstOrDefaultAsync();

            var projectDateActive = project.DateActive;

            var dateActive = DateTime.MinValue;
            foreach (var product in project.Products)
            {
                if (product.ProductWorkflow != null)
                {
                    if (product.DateUpdated.Value > dateActive)
                    {
                        dateActive = product.DateUpdated.Value;
                    }
                }
            }

            if (dateActive > DateTime.MinValue)
            {
                project.DateActive = dateActive;
            } else
            {
                project.DateActive = null;
            }

            if (project.DateActive != projectDateActive)
            {
                await ProjectRepository.UpdateAsync(project);
            }
        }
    }
}