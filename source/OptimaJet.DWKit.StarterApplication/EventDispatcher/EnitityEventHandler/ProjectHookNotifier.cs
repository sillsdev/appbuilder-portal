using System;
using JsonApiDotNetCore.Data;
using Microsoft.AspNetCore.SignalR;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Utility;

namespace OptimaJet.DWKit.StarterApplication.EventDispatcher.EntityEventHandler
{
    public class ProjectHookNotifier : BaseHookNotifier<Project>
    {
        public ProjectHookNotifier(
            IDbContextResolver dbContextResolver,
            IHubContext<ScriptoriaHub> hubContext
        ) : base(dbContextResolver, hubContext)
        {
        }
    }
}
