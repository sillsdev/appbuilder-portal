using System;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Serilog;
using Serilog.Events;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore;
using static OptimaJet.DWKit.StarterApplication.Utility.EnvironmentHelpers;

namespace OptimaJet.DWKit.StarterApplication
{
    public class Program
    {
        private static IConfiguration Configuration { get; } = new ConfigurationBuilder()
          .SetBasePath(Directory.GetCurrentDirectory())
          .AddEnvironmentVariables()
          .Build();

        public static void Main(string[] args)
        {
            dotenv.net.DotEnv.Config(false, ".env.dev");
            dotenv.net.DotEnv.Config(false, ".env");

            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .CreateLogger();

            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            var baseUrl = GetVarOrDefault("API_BASE_URL", "http://localhost:48801");
            var port = new Uri(baseUrl).Port;

            return WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .UseKestrel()
                .UseIISIntegration()
                .UseApplicationInsights()
                .UseConfiguration(Configuration)
                .UseSerilog()
                .UseUrls("http://0.0.0.0:" + port)
                .Build();


        }
    }
}
