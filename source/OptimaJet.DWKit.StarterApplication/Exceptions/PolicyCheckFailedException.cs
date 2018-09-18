using System;
namespace OptimaJet.DWKit.StarterApplication.Exceptions
{
    public class PolicyCheckFailedException : Exception
    {
        public PolicyCheckFailedException(string message) : base (message)
        {}
    }
}
