using OptimaJet.DWKit.StarterApplication.Services;

namespace SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios.ServiceOverrides
{
    internal class TestCurrentUserContext : ICurrentUserContext
    {
        public string Email => "test-email@test.test";

        public string GivenName => "Test";

        public string FamilyName => "Testenson";

        public string Name => "Test Testenson";

        public string Auth0Id => "test-auth0-id";
  }
}