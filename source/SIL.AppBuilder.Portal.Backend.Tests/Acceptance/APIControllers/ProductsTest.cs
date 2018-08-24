using System;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    [Collection("WithoutAuthCollection")]
    public class ProductsTest : BaseTest<NoAuthStartup>
    {
        public ProductsTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }

        private void TestDataSetup()
        {
        }
    }
}
