using System;
using Hangfire;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public interface IHangfireWrapper
    {
        IBackgroundJobClient BackgroundJobClient { get; }
    }
}
