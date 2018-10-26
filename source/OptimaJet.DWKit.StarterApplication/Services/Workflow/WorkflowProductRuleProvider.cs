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
            //Register your rules in the _rules Dictionary
            //_rules.Add("CheckRole", new RuleFunction { CheckFunction = RoleCheck, GetFunction = RoleGet });
            _rules.Add("IsProjectOwner", new RuleFunction { CheckFunction = ProjectOwnerCheck, GetFunction = ProjectOwnerGet });
            _rules.Add("IsOrgAdmin", new RuleFunction { CheckFunction = OrgAdminCheck, GetFunction = OrgAdminGet });
            ServiceProvider = serviceProvider;
        }

        public IEnumerable<string> OrgAdminGet(ProcessInstance processInstance, WorkflowRuntime runtime, string parameter)
        {
            using (var scope = ServiceProvider.CreateScope()) {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product>>();
                var product = productRepository.Get().Where(p => p.WorkflowProcessId == processInstance.ProcessId).FirstOrDefault();
                if (product != null) {

                }
            }
            var documentModel = MetadataToModelConverter.GetEntityModelByModelAsync("Product").Result;
            var managerId = documentModel.GetAsync(Filter.And.Equal(processInstance.ProcessId, "Id")).Result.FirstOrDefault()?["ManagerId"];
            return managerId != null ? new List<string> { managerId.ToString() } : new List<string>();
        }

        public bool OrgAdminCheck(ProcessInstance processInstance, WorkflowRuntime runtime, string identityId, string parameter)
        {
            var documentModel = MetadataToModelConverter.GetEntityModelByModelAsync("Document").Result;
            var managerId = documentModel.GetAsync(Filter.And.Equal(processInstance.ProcessId, "Id")).Result.FirstOrDefault()?["ManagerId"];
            return managerId != null && identityId == managerId.ToString();
        }

        public IEnumerable<string> ProjectOwnerGet(ProcessInstance processInstance, WorkflowRuntime runtime, string parameter)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product>>();
                var product = productRepository.Get()
                    .Where(p => p.WorkflowProcessId == processInstance.ProcessId)
                    .Include(p => p.Project)
                        .ThenInclude(p => p.Owner)
                    .FirstOrDefault();
                var workflowUserId = product?.Project.Owner.WorkflowUserId;
                return workflowUserId.HasValue ? new List<string> { workflowUserId.Value.ToString() } : new List<string>();
            }

            //var documentModel = MetadataToModelConverter.GetEntityModelByModelAsync("Document").Result;
            //var authorId = documentModel.GetAsync(Filter.And.Equal(processInstance.ProcessId, "Id")).Result.FirstOrDefault()?["AuthorId"];
            //return authorId != null ? new List<string> { authorId.ToString() } : new List<string>();
        }

        public bool ProjectOwnerCheck(ProcessInstance processInstance, WorkflowRuntime runtime, string identityId, string parameter)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product>>();
                var product = productRepository.Get()
                    .Where(p => p.WorkflowProcessId == processInstance.ProcessId)
                    .Include(p => p.Project)
                        .ThenInclude(p => p.Owner)
                    .FirstOrDefault();
                var workflowUserId = product?.Project.Owner.WorkflowUserId;
                return workflowUserId.HasValue && workflowUserId.Value == new Guid(identityId);
            }

            //var documentModel = MetadataToModelConverter.GetEntityModelByModelAsync("Document").Result;
            //var authorId = documentModel.GetAsync(Filter.And.Equal(processInstance.ProcessId, "Id")).Result.FirstOrDefault()?["AuthorId"].ToString();
            //return identityId == authorId;
        }

        //public IEnumerable<string> RoleGet(ProcessInstance processInstance, WorkflowRuntime runtime, string parameter)
        //{
        //    var rolesModel = MetadataToModelConverter.GetEntityModelByModelAsync("dwSecurityRole").Result;
        //    var role = rolesModel.GetAsync(Filter.And.Equal(parameter, "Name")).Result.FirstOrDefault();
        //    if (role == null)
        //        return new List<string>();
        //    var roleUserModel = MetadataToModelConverter.GetEntityModelByModelAsync("dwV_Security_UserRole").Result;
        //    return roleUserModel.GetAsync(Filter.And.Equal(role.GetId(), "RoleId")).Result.Select(r => r["UserId"].ToString()).Distinct();
        //}

        //public bool RoleCheck(ProcessInstance processInstance, WorkflowRuntime runtime, string identityId, string parameter)
        //{
        //    var rolesModel = MetadataToModelConverter.GetEntityModelByModelAsync("dwSecurityRole").Result;
        //    var role = rolesModel.GetAsync(Filter.And.Equal(parameter, "Name")).Result.FirstOrDefault();
        //    if (role == null)
        //        return false;
        //    var roleUserModel = MetadataToModelConverter.GetEntityModelByModelAsync("dwV_Security_UserRole").Result;
        //    return roleUserModel.GetCountAsync(Filter.And.Equal(role.GetId(), "RoleId").Equal(Guid.Parse(identityId), "UserId")).Result > 0;
        //}

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
