using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Metadata;

namespace OptimaJet.DWKit.StarterApplication.Data.DWKit
{
  public class BusinessFlow 
  {
    // public static async Task<Form> GetForm(string name, Guid? id)
    // {
    //   var md = await DWKitRuntime.Metadata.GetCollectionAsync(new List<MetadataSectionQuery>()
    //   {
    //       new MetadataSectionQuery(MetadataSections.Businessflow)
    //   });

    //   var flow = md.BusinessFlow?.FirstOrDefault(c => c.Name != null && c.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
    //   if (flow == null)
    //       throw new Exception("The flow is not found!");

    //   string stateName = null;
    //   var currentUser = DWKitRuntime.Security.CurrentUser;
    //   var roles = currentUser.IsImpersonated ? currentUser.ImpersonatedUserRoles : currentUser.Roles;
      
    //   var wfRuntime = DWKitRuntime.GetCreatedWorkflowRuntime();
    //   if (wfRuntime == null)
    //       throw new Exception("WorkflowRuntime must be initialized before call ConfigAPI!");

    //   if (id.HasValue && flow.Map != null && flow.Map.Count > 0)
    //   {
    //       if (await wfRuntime.IsProcessExistsAsync(id.Value))
    //       {
    //           var state = await wfRuntime.GetCurrentStateAsync(id.Value);
    //           stateName = state?.Name;
    //       }
    //   }
    //   else if (!string.IsNullOrEmpty(flow.Scheme))
    //   {
    //       stateName = (await wfRuntime.GetInitialStateAsync(flow.Scheme))?.Name;
    //   }

    //   return OptimaJet.DWKit.Core.Metadata.BusinessFlow.GetForm(flow, stateName, roles);
    // }
  }
}