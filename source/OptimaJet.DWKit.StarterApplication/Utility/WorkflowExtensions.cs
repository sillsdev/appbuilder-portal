using System;
using OptimaJet.Workflow.Core.Persistence;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public static class  WorkflowExtensions
    {
        public static String StatusString(this ProcessStatus status)
        {
            String result;
            if (status == ProcessStatus.Initialized) {
                result = "Initialized";
            } else if (status == ProcessStatus.Running) {
                result = "Running";
            } else if (status == ProcessStatus.Idled) {
                result = "Idled";
            } else if (status == ProcessStatus.Finalized) {
                result = "Finalized";
            } else if (status == ProcessStatus.Terminated) {
                result = "Terminated";
            } else if (status == ProcessStatus.Error) {
                result = "Error";
            } else {
                result = "";
            }
            return result;
        }
    }
}
