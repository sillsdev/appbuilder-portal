using System;
using Hangfire;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.Application;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using OptimaJet.DWKit.StarterApplication.Services.Workflow;
using OptimaJet.Workflow.Core.Runtime;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public static class ApplicationExtensions
    {
        public static IApplicationBuilder UseWorkflow(this IApplicationBuilder app, IConfigurationRoot configuration)
        {
            // WorkflowInit static properties need to be setup before Configurator.Configure since 
            // WorkflowRuntime.ForceInit is called.
            WorkflowInit.RuleProvider = app.ApplicationServices.GetRequiredService<IWorkflowRuleProvider>();
            //DWKIT Init
            Configurator.Configure(
                (IHttpContextAccessor)app.ApplicationServices.GetService(typeof(IHttpContextAccessor)),
                (IHubContext<ClientNotificationHub>)app.ApplicationServices.GetService(typeof(IHubContext<ClientNotificationHub>)),
                configuration);

            WorkflowRuntime runtime = app.ApplicationServices.GetService(typeof(WorkflowRuntime)) as WorkflowRuntime;
            var workflowService = app.ApplicationServices.GetService(typeof(WorkflowActivityMonitorService)) as WorkflowActivityMonitorService;
            workflowService.RegisterEventHandlers(runtime);

            RecurringJob.AddOrUpdate<WorkflowActivityMonitorService>("WorkflowActivityMonitor", service => service.CheckActivityStatus(), Cron.MinuteInterval(5));
            RecurringJob.AddOrUpdate<WorkflowSecuritySyncService>("WorkflowSecuritySync", service => service.SyncWorkflowSecurity(), Cron.MinuteInterval(5));
            return app;
        }

        public static IApplicationBuilder UseBuildEngine(this IApplicationBuilder app, IConfigurationRoot configuration)
        {
            RecurringJob.AddOrUpdate<BuildEngineSystemMonitor>("BuildEngineMonitor", service => service.CheckBuildEngineStatus(), Cron.MinuteInterval(5));

            return app;
        }
    }
}
