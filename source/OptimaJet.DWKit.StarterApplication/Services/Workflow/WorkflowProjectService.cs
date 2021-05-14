using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;

namespace OptimaJet.DWKit.StarterApplication.Services.Workflow
{
    public class WorkflowProjectService
    {

        public IJobRepository<Project> ProjectRepository { get; }
        public IJobRepository<ProductTransition> ProductTransitionRepository { get; }
        public IJobRepository<User> UserRepository { get; }
        public WorkflowProductService WorkflowProductService { get; }

        public WorkflowProjectService(
            IJobRepository<Project> projectRepository,
            IJobRepository<ProductTransition> productTransitionRepository,
            IJobRepository<User> userRepository,
            WorkflowProductService productService
        )
        {
            this.ProjectRepository = projectRepository;
            ProductTransitionRepository = productTransitionRepository;
            UserRepository = userRepository;
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

        public void AddTokenUse(int projectId, int userId, string use)
        {
            AddTokenUseAsync(projectId,userId, use).Wait();
        }

        public async Task AddTokenUseAsync(int projectId, int userId, string use)
        {
            var project = await this.ProjectRepository.Get()
                .Include(proj => proj.Products)
                .Where(p => p.Id == projectId)
                .FirstOrDefaultAsync();

            var user = await this.UserRepository.Get()
                .Where(u => u.Id == userId)
                .FirstOrDefaultAsync();

            if (project == null || user == null)
            {
                return;
            }

            foreach (var product in project.Products)
            {
                var transition = new ProductTransition
                {
                    ProductId = product.Id,
                    AllowedUserNames = string.Empty,
                    TransitionType = ProductTransitionType.ProjectAccess,
                    InitialState = "Project " + use,
                    WorkflowUserId = user.WorkflowUserId,
                    DateTransition = DateTime.UtcNow
                };

                await ProductTransitionRepository.CreateAsync(transition);
            }
        }
    }
}