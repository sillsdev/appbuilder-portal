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

namespace OptimaJet.DWKit.StarterApplication.Services.Workflow
{
    public class WorkflowProjectService
    {
        public class ProductProcessChangedArgs
        {
            public Guid ProcessId { get; set; }
            public string CurrentActivityName { get; set; }
            public string PreviousActivityName { get; set; }
            public string CurrentState { get; set; }
            public string PreviousState { get; set; }
            public string ExecutingCommand { get; set; }
        };

    public IJobRepository<Project> ProjectRepository { get; }
    IJobRepository<Product, Guid> ProductRepository { get; set; }
        public IJobRepository<UserTask> TaskRepository { get; }
        public IJobRepository<User> UserRepository { get; }
        public IJobRepository<ProductTransition> ProductTransitionRepository { get; }
        public SendNotificationService SendNotificationService { get; }
        public WorkflowRuntime Runtime { get; }

        public WorkflowProjectService(
            IJobRepository<Project> projectRepository,
            IJobRepository<Product, Guid> productRepository,
            IJobRepository<UserTask> taskRepository,
            IJobRepository<User> userRepository,
            IJobRepository<ProductTransition> productTransitionRepository,
            SendNotificationService sendNotificationService,
            WorkflowRuntime runtime
        )
        {
            ProjectRepository = projectRepository;
            ProductRepository = productRepository;
            TaskRepository = taskRepository;
            UserRepository = userRepository;
            ProductTransitionRepository = productTransitionRepository;
            SendNotificationService = sendNotificationService;
            Runtime = runtime;
        }

        public async Task ReassignUserTasks(int projectId, int previousOwnerId, int newOwnerId, PerformContext context) {
          var project = await this.ProjectRepository.Get()
              .Include(p => p.Products)
              .ThenInclude(product => product.UserTasks)
              .Where(p => p.Id == projectId)
              .FirstOrDefaultAsync();
          var previousOwner = await this.UserRepository.GetAsync(previousOwnerId);
          var newOwner = await this.UserRepository.GetAsync(newOwnerId);

          project.Products.ForEach(product => {
              this.ReassignUserTasksForProduct(product, previousOwner, newOwner);
          });
        }

        private void ReassignUserTasksForProduct(Product product, User previous, User next) {
          product.UserTasks
              .Where(task => task.UserId == previous.Id)
              .ToList()
              .ForEach(task => {
                  task.User = next;
                  TaskRepository.UpdateAsync(task);
              });
        }

    }
}