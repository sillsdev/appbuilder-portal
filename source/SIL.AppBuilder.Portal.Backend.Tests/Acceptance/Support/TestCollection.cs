using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    [CollectionDefinition("WithAuthCheckingCollection")]
    public class WithAuthCheckingCollection : ICollectionFixture<TestFixture<TestStartup>> {}

    [CollectionDefinition("WithoutAuthCollection")]
    public class WithoutAuthCollection : ICollectionFixture<TestFixture<NoAuthStartup>> {}
}
