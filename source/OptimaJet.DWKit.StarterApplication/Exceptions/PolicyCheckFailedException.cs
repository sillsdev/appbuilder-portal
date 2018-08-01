using System;
namespace Optimajet.DWKit.StarterApplication.Exceptions
{
    public class PolicyCheckFailedException : Exception
    {
        public PolicyCheckFailedException(string message) : base (message)
        {}
    }
}
