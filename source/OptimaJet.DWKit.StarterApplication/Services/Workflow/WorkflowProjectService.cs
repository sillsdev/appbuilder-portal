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
        public IJobRepository<UserTask> TaskRepository { get; }
        public IJobRepository<User> UserRepository { get; }
        public WorkflowProductService WorkflowProductService { get; }

        public WorkflowProjectService(
            IJobRepository<Project> projectRepository,
            IJobRepository<UserTask> taskRepository,
            IJobRepository<User> userRepository,
            WorkflowProductService productService
        )
        {
            ProjectRepository = projectRepository;
            TaskRepository = taskRepository;
            UserRepository = userRepository;
            WorkflowProductService = productService;
        }

        public async Task ReassignUserTasks(int projectId, int previousOwnerId, int newOwnerId) {
            var project = await this.ProjectRepository.Get()
                .Include(p => p.Products)
                .Where(p => p.Id == projectId)
                .FirstOrDefaultAsync();
            var previousOwner = await this.UserRepository.GetAsync(previousOwnerId);
            var newOwner = await this.UserRepository.GetAsync(newOwnerId);

            project.Products.ForEach(async product => {
                await this.WorkflowProductService.ReassignUserTasksForProduct(product);
            });
        }
    }
}