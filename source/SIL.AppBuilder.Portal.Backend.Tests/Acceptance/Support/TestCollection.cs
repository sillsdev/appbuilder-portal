using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
   // [CollectionDefinition("WithAuthCheckingCollection")]
   // public class WithAuthCheckingCollection : ICollectionFixture<TestFixture<TestStartup>> {}

    [CollectionDefinition("WithoutAuthCollection")]
    public class WithoutAuthCollection : ICollectionFixture<TestFixture<NoAuthStartup>> {}

    [CollectionDefinition("BuildEngineCollection")]
    public class BuildEngineCollection : ICollectionFixture<TestFixture<BuildEngineStartup>> {}
}
