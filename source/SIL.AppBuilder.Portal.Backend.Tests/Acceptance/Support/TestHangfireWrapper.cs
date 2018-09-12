using System;
using Hangfire;
using Moq;
using OptimaJet.DWKit.StarterApplication.Services;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support
{
    public class TestHangfireWrapper : IHangfireWrapper
    {
        public static Mock<IBackgroundJobClient> client = new Mock<IBackgroundJobClient>();
        public IBackgroundJobClient BackgroundJobClient => client.Object;
    }
}
