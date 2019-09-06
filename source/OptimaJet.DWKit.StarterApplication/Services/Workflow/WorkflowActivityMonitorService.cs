using System;
using System.Collections.Generic;
using System.Net.Mime;
using System.Text;
using Hangfire;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.StarterApplication.Utility;
using OptimaJet.Workflow.Core.Model;
using OptimaJet.Workflow.Core.Persistence;
using OptimaJet.Workflow.Core.Runtime;
using Serilog;
using SIL.AppBuilder.BuildEngineApiClient;

namespace OptimaJet.DWKit.StarterApplication.Services.Workflow
{
    public class WorkflowActivityMonitorService
    {
        public WorkflowRuntime Runtime { get; set; }
        public IServiceProvider ServiceProvider { get; }

        public WorkflowActivityMonitorService(IServiceProvider serviceProvider)
        {
            ServiceProvider = serviceProvider;
        }

        public void RegisterEventHandlers(WorkflowRuntime runtime)
        {
            Runtime = runtime;
            Runtime.ProcessActivityChanged += (sender, args) => { ActivityChanged(args, Runtime); };
            Runtime.ProcessStatusChanged += (sender, args) => { ProcessChanged(args, Runtime); };
            Runtime.OnWorkflowError += (sender, args) => { ProcessException(args, Runtime); };
        }

        private void ProcessException(WorkflowErrorEventArgs args, WorkflowRuntime runtime)
        {
            // Follow recommendation 
            // https://workflowengine.io/documentation/scheme/timers/

            var isTimerTriggeredTransitionChain =
                !string.IsNullOrEmpty(args.ProcessInstance.ExecutedTimer) //for timers executed from main branch
                || (args.ProcessInstance.MergedSubprocessParameters != null //for timers executed from subprocess
                && !string.IsNullOrEmpty(args.ProcessInstance.MergedSubprocessParameters.GetParameter(DefaultDefinitions.ParameterExecutedTimer.Name)?.Value?.ToString()));

            // We have to delay creation of the Bugsnag Client until runtime instead
            // of constructor dependency injection due to crashing on startup
            using (var scope = ServiceProvider.CreateScope())
            {
                var client = scope.ServiceProvider.GetRequiredService<Bugsnag.IClient>();
                client.Notify(args.Exception, (report) =>
                {
                    report.Event.Metadata.Add("details", new Dictionary<string, object>
                    {
                        { "handler", "OnWorkflowError" },
                        { "timer",  isTimerTriggeredTransitionChain},
                        { "process-id", args.ProcessInstance.ProcessId },
                        { "schema-code", args.ProcessInstance.SchemeCode },
                        { "schema-id", args.ProcessInstance.SchemeId }
                    });

                    if (args.Exception is ResponseException responseException)
                    {
                        var contentType = new ContentType(responseException.ContentType);
                        var charset = contentType.CharSet ?? "UTF-8";
                        var encoding = Encoding.GetEncoding(charset);
                        var content = encoding.GetString(responseException.RawBytes, 0, responseException.RawBytes.Length);

                        report.Event.Metadata.Add("response", new Dictionary<string, object>
                        {
                            { "content", content},
                            { "content-length", responseException.ContentLength },
                            { "content-type", responseException.ContentType }
                        });
                    }

                });
            }

            if (isTimerTriggeredTransitionChain)
            {
                Log.Error($"Exception::: Timer: {args.Exception.Message}");
                args.SuppressThrow = true;
            }
            else
            {
                Log.Error($"Exception::: Command: {args.Exception.Message}");
                runtime.SetActivityWithExecution(
                    identityId: null,
                    impersonatedIdentityId: null,
                    parameters: new Dictionary<string, object>(),
                    activityToSet: args.ProcessInstance.ProcessScheme.InitialActivity,
                    processInstance: args.ProcessInstance,
                    doNotSetRunningStatus: true
                );
            }
        }

        private void ActivityChanged(ProcessActivityChangedEventArgs args, WorkflowRuntime runtime)
        {
            if (!args.TransitionalProcessWasCompleted)
                return;

            Log.Information($":::::::::: ActivityChanged: pid={args.ProcessId.ToString()}, scheme={args.SchemeCode}, activity={args.CurrentActivityName}, state={args.CurrentState}, last={args.PreviousState}");
            WorkflowProductService.TransitionType transitionType = GetTransitionType(args);
            var serviceArgs = new WorkflowProductService.ProductActivityChangedArgs
            {
                ProcessId = args.ProcessId,
                CurrentActivityName = args.CurrentActivityName,
                PreviousActivityName = args.PreviousActivityName,
                CurrentState = args.CurrentState,
                PreviousState = args.PreviousState,
                ExecutingCommand = args.ProcessInstance.CurrentCommand,
                TransitionType = transitionType
            };

            BackgroundJob.Enqueue<WorkflowProductService>(service => service.ProductActivityChanged(serviceArgs));
        }

        private WorkflowProductService.TransitionType GetTransitionType(ProcessActivityChangedEventArgs args)
        {
            WorkflowProductService.TransitionType transitionType = WorkflowProductService.TransitionType.Other;
            // In DWKit 2.4.1, when executing a timeout transition back to the same state,
            // args.ExecutedTransition isn't the transition that is actually being executed 
            // (seems to be the first transition of all defined).  In this case, ignore the
            // transition type.
            if (args.ExecutedTransition != null)
            {
                if ((args.CurrentState == args.ExecutedTransition.To.State) && (args.PreviousState == args.ExecutedTransition.From.State))
                {
                    switch (args.ExecutedTransition.Classifier)
                    {
                        case TransitionClassifier.Direct:
                            transitionType = WorkflowProductService.TransitionType.Continuation;
                            break;
                        case TransitionClassifier.Reverse:
                            transitionType = (args.ExecutedTransition.Trigger.Type == TriggerType.Command)
                                ? WorkflowProductService.TransitionType.Rejection
                                : WorkflowProductService.TransitionType.Reverse;
                            break;
                        default:
                            transitionType = WorkflowProductService.TransitionType.Other;
                            break;
                    }
                }
                else
                {
                    Log.Warning($":::: Executing Transition Mismatch: PreviousState={args.PreviousState}=>CurrentState={args.CurrentState}; TransitionName={args.ExecutedTransition.Name}, From={args.ExecutedTransition.From.State} => To={args.ExecutedTransition.To.State}");
                }
            }

            return transitionType;
        }

        private void ProcessChanged(ProcessStatusChangedEventArgs args, WorkflowRuntime runtime)
        {
            Log.Information($":::::::::: ProcessChanged: pid={args.ProcessId.ToString()}, scheme={args.SchemeCode}, new={args.NewStatus.StatusString()}, old={args.OldStatus.StatusString()}");
            if (String.IsNullOrWhiteSpace(args.ProcessInstance.CurrentActivityName)) return;

            // Delete the Workflow once completed
            if (args.NewStatus == ProcessStatus.Finalized)
            {
                var serviceArgs = new WorkflowProductService.ProductProcessChangedArgs
                {
                    ProcessId = args.ProcessId,
                    OldStatus = args.OldStatus.StatusString(),
                    NewStatus = args.NewStatus.StatusString(),
                    SchemaCode = args.SchemeCode
                };
                BackgroundJob.Schedule<WorkflowProductService>(service => service.ProductProcessChanged(serviceArgs), TimeSpan.FromSeconds(15));
            }
        }

        public void CheckActivityStatus()
        {
        }

        //
        // Note: It took a while to figure out how to iterate through all the current
        //       processes and try to restart them.  I thought I would need this to
        //       handle Timers getting cleared on startup.  Looks like they are not
        //       cleared.  Keeping this here just in case we need it in the future. -- ChrisH

        //public void RestartIdleActivites()
        //{
        //    RestartIdleActivitesAsync().Wait();
        //}
        //public async Task RestartIdleActivitesAsync()
        //{
        //    var procs = await WorkflowProcessInstance.SelectAsync(Filter.And.Equal(2 /*Idle*/, "InstanceStatus"));
        //    foreach (var proc in procs)
        //    {
        //        var procInstance = await Runtime.GetProcessInstanceAndFillProcessParametersAsync(proc.Id);
        //        Runtime.SetActivityWithExecution(
        //            identityId: null,
        //            impersonatedIdentityId: null,
        //            parameters: new Dictionary<string, object>(),
        //            activityToSet: procInstance.CurrentActivity,
        //            processInstance: procInstance,
        //            doNotSetRunningStatus: false
        //        );
        //    }
        //}
    }
}
