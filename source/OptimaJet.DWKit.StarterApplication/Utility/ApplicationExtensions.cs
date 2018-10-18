using System;
using Hangfire;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using OptimaJet.DWKit.Application;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using OptimaJet.DWKit.StarterApplication.Services.Workflow;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public static class ApplicationExtensions
    {
        public static IApplicationBuilder UseWorkflow(this IApplicationBuilder app, IConfigurationRoot configuration)
        {
            Configurator.Configure(
                (IHttpContextAccessor)app.ApplicationServices.GetService(typeof(IHttpContextAccessor)),
                configuration);

            WorkflowActivityMonitorService.RegisterEventHandlers(WorkflowInit.Runtime);
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
