using System;
using Hangfire;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class HangfireWrapper : IHangfireWrapper
    {
        public IBackgroundJobClient BackgroundJobClient => new BackgroundJobClient(JobStorage.Current);
    }
}
