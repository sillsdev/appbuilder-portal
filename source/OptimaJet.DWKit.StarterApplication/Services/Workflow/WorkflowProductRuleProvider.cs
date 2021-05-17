using System;
using System.Collections.Generic;
using System.Linq;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Model;
using OptimaJet.Workflow.Core.Model;
using OptimaJet.Workflow.Core.Runtime;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Models;
using Microsoft.EntityFrameworkCore;

namespace OptimaJet.DWKit.StarterApplication.Services.Workflow
{
    public class WorkflowProductRuleProvider : IWorkflowRuleProvider
    {
        private class RuleFunction
        {
            public Func<ProcessInstance, WorkflowRuntime, string, IEnumerable<string>> GetFunction { get; set; }

            public Func<ProcessInstance, WorkflowRuntime, string, string, bool> CheckFunction { get; set; }
        }

        private readonly Dictionary<string, RuleFunction> _rules = new Dictionary<string, RuleFunction>();

        public IServiceProvider ServiceProvider { get; }

        public WorkflowProductRuleProvider(IServiceProvider serviceProvider)
        {
            ServiceProvider = serviceProvider;

            //Register your rules in the _rules Dictionary
            _rules.Add("CheckRole", new RuleFunction { CheckFunction = RoleCheck, GetFunction = RoleGet });
            _rules.Add("IsOwner", new RuleFunction { CheckFunction = ProjectOwnerCheck, GetFunction = ProjectOwnerGet });
            _rules.Add("IsOrgAdmin", new RuleFunction { CheckFunction = OrgAdminCheck, GetFunction = OrgAdminGet });
            _rules.Add("IsAuthor", new RuleFunction { CheckFunction = ProjectAuthorCheck, GetFunction = ProjectAuthorGet });

        }

        //
        // CheckRole
        //
        public IEnumerable<string> RoleGet(ProcessInstance processInstance, WorkflowRuntime runtime, string parameter)
        {
            var rolesModel = MetadataToModelConverter.GetEntityModelByModelAsync("dwSecurityRole").Result;
            var role = rolesModel.GetAsync(Filter.And.Equal(parameter, "Name")).Result.FirstOrDefault();
            if (role == null)
                return new List<string>();
            var roleUserModel = MetadataToModelConverter.GetEntityModelByModelAsync("dwV_Security_UserRole").Result;
            return roleUserModel.GetAsync(Filter.And.Equal(role.GetId(), "RoleId")).Result.Select(r => r["UserId"].ToString()).Distinct();
        }

        public bool RoleCheck(ProcessInstance processInstance, WorkflowRuntime runtime, string identityId, string parameter)
        {
            if (!Guid.TryParse(identityId, out Guid identity))
            {
                return false;
            }

            var rolesModel = MetadataToModelConverter.GetEntityModelByModelAsync("dwSecurityRole").Result;
            var role = rolesModel.GetAsync(Filter.And.Equal(parameter, "Name")).Result.FirstOrDefault();
            if (role == null)
                return false;
            var roleUserModel = MetadataToModelConverter.GetEntityModelByModelAsync("dwV_Security_UserRole").Result;
            return roleUserModel.GetCountAsync(Filter.And.Equal(role.GetId(), "RoleId").Equal(identity, "UserId")).Result > 0;
        }

        //
        // IsOrgAdmin
        //
        public IEnumerable<string> OrgAdminGet(ProcessInstance processInstance, WorkflowRuntime runtime, string parameter)
        {
            using (var scope = ServiceProvider.CreateScope()) {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                var userRolesRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<UserRole>>();
                var product = productRepository.Get()
                    .Where(p => p.Id == processInstance.ProcessId)
                    .Include(p => p.Project)
                        .ThenInclude(p => p.Organization)
                    .FirstOrDefault();
                if (product == null)
                {
                    return new List<string>();
                }

                var organization = product.Project.Organization;
                var orgAdmins = userRolesRepository.Get()
                    .Include(ur => ur.User)
                    .Include(ur => ur.Role)
                    .Where(ur => ur.OrganizationId == organization.Id && ur.Role.RoleName == RoleName.OrganizationAdmin && ur.User.WorkflowUserId.HasValue)
                    .Select(r => r.User.WorkflowUserId.Value.ToString())
                    .ToList();
                return orgAdmins;
            }
        }

        public bool OrgAdminCheck(ProcessInstance processInstance, WorkflowRuntime runtime, string identityId, string parameter)
        {
            var workflowUserId = new Guid(identityId);
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                var userRolesRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<UserRole>>();
                var product = productRepository.Get()
                    .Where(p => p.Id == processInstance.ProcessId)
                    .Include(p => p.Project)
                        .ThenInclude(p => p.Organization)
                    .FirstOrDefault();
                if (product == null)
                {
                    return false;
                }

                var userRole = userRolesRepository.Get()
                    .Include(ur => ur.User)
                    .Where(ur => ur.OrganizationId == product.Project.OrganizationId && ur.User.WorkflowUserId.HasValue && ur.User.WorkflowUserId.Value == workflowUserId)
                    .FirstOrDefault();
                return userRole != null;
            }
        }

        //
        // IsOwner
        //
        public IEnumerable<string> ProjectOwnerGet(ProcessInstance processInstance, WorkflowRuntime runtime, string parameter)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                var product = productRepository.Get()
                    .Where(p => p.Id == processInstance.ProcessId)
                    .Include(p => p.Project)
                        .ThenInclude(p => p.Owner)
                    .FirstOrDefault();
                var workflowUserId = product?.Project.Owner.WorkflowUserId;
                return workflowUserId.HasValue ? new List<string> { workflowUserId.Value.ToString() } : new List<string>();
            }
        }

        public bool ProjectOwnerCheck(ProcessInstance processInstance, WorkflowRuntime runtime, string identityId, string parameter)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                var product = productRepository.Get()
                    .Where(p => p.Id == processInstance.ProcessId)
                    .Include(p => p.Project)
                        .ThenInclude(p => p.Owner)
                    .FirstOrDefault();
                var workflowUserId = product?.Project.Owner.WorkflowUserId;
                return workflowUserId.HasValue && workflowUserId.Value == new Guid(identityId);
            }
        }

        //
        // IsAuthor
        //
        public IEnumerable<string> ProjectAuthorGet(ProcessInstance processInstance, WorkflowRuntime runtime, string parameter)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                var product = productRepository.Get()
                    .Where(p => p.Id == processInstance.ProcessId)
                    .Include(p => p.Project)
                        .ThenInclude(p => p.Authors)
                            .ThenInclude(a => a.User)
                    .FirstOrDefault();
                if (product == null)
                {
                    return new List<string>();
                }

                var authorWorkflowUserIds = product.Project.Authors.Select(a => a.User.WorkflowUserId.Value.ToString()).ToList();
                return authorWorkflowUserIds;
            }
        }

        public bool ProjectAuthorCheck(ProcessInstance processInstance, WorkflowRuntime runtime, string identityId, string parameter)
        {
            var workflowUserId = new Guid(identityId);
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                var userRolesRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<UserRole>>();
                var product = productRepository.Get()
                    .Where(p => p.Id == processInstance.ProcessId)
                    .Include(p => p.Project)
                        .ThenInclude(p => p.Authors)
                            .ThenInclude(a => a.User)
                    .FirstOrDefault();
                if (product == null)
                {
                    return false;
                }

                var author = product.Project.Authors.Where(a => a.User.WorkflowUserId.GetValueOrDefault() == workflowUserId).FirstOrDefault();
                return author != null;
            }
        }

        #region Implementation of IWorkflowRuleProvider

        public List<string> GetRules()
        {
            return _rules.Keys.ToList();
        }

        public bool Check(ProcessInstance processInstance, WorkflowRuntime runtime, string identityId, string ruleName,
            string parameter)
        {
            if (_rules.ContainsKey(ruleName))
                return _rules[ruleName].CheckFunction(processInstance, runtime, identityId, parameter);
            throw new NotImplementedException();
        }

        public IEnumerable<string> GetIdentities(ProcessInstance processInstance, WorkflowRuntime runtime,
            string ruleName, string parameter)
        {
            if (_rules.ContainsKey(ruleName))
                return _rules[ruleName].GetFunction(processInstance, runtime, parameter);
            throw new NotImplementedException();
        }

        #endregion
    }
}
