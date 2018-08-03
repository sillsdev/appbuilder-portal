using System;
using System.Linq;
using Bugsnag;
using Hangfire.Common;
using Hangfire.States;

namespace OptimaJet.DWKit.StarterApplication.Middleware
{
    // See: https://github.com/HangfireIO/Hangfire/issues/553
    public class ErrorReportingJobFilter : JobFilterAttribute, IElectStateFilter
    {
        protected readonly IClient bugsnagClient;

        public ErrorReportingJobFilter(IClient bugsnagClient)
        {
            this.bugsnagClient = bugsnagClient;
        }

        public void OnStateElection(ElectStateContext context)
        {
            // the way Hangfire works is retrying a job X times (10 by default), so this wont be called directly with a 
            // failed state sometimes.
            // To solve this we should look into TraversedStates for a failed state

            var failed = context.CandidateState as FailedState ??
                         context.TraversedStates.FirstOrDefault(x => x is FailedState) as FailedState;

            if (failed == null)
                return;

            //here you have the failed.Exception and you can do anything with it
            //and also the job name context.Job.Type.Name
            bugsnagClient.Notify(failed.Exception);
        }
    }
}
