
using Microsoft.Extensions.Configuration;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
  public static class ConfigurationExtensions
  {
    public static IConfigurationBuilder AddEnvFiles(this IConfigurationBuilder builder) {

      dotenv.net.DotEnv.Config(false, ".env.dev");
      dotenv.net.DotEnv.Config(false, ".env");

      return builder;
    }
  }
}
