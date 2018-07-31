using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    [CollectionDefinition("WebHostCollection")]
    public class WebHostCollection
        : ICollectionFixture<TestFixture<TestStartup>>
    { }
}
