using System;
using System.Threading.Tasks;
using OptimaJet.Workflow.Core.Persistence;
using OptimaJet.Workflow.Core.Runtime;
using OptimaJet.DWKit.StarterApplication.Utility;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services.Workflow
{
    public class WorkflowActivityMonitorService
    {
        public WorkflowActivityMonitorService()
        {

        }
        public static void RegisterEventHandlers(WorkflowRuntime runtime)
        {
            runtime.ProcessActivityChanged += (sender, args) => { ActivityChanged(args, runtime).Wait(); };
            runtime.ProcessStatusChanged += (sender, args) => { ProcessChanged(args, runtime).Wait(); };
        }

        private static async Task ActivityChanged(ProcessActivityChangedEventArgs args, WorkflowRuntime runtime)
        {
            if (!args.TransitionalProcessWasCompleted)
                return;

            Log.Information($":::::::::: ActivityChanged: pid={args.ProcessId.ToString()}, scheme={args.SchemeCode}, activity={args.CurrentActivityName}, state={args.CurrentState}, last={args.PreviousState}");
            await Task.CompletedTask;
            //TODO change Document transition history and WorkflowInbox
        }

        private static async Task ProcessChanged(ProcessStatusChangedEventArgs args, WorkflowRuntime runtime)
        {
            Log.Information($":::::::::: ProcessChanged: pid={args.ProcessId.ToString()}, scheme={args.SchemeCode}, new={args.NewStatus.StatusString()}, old={args.OldStatus.StatusString()}");

            await Task.CompletedTask;
        }

        public void CheckActivityStatus()
        {
        }
    }
}
