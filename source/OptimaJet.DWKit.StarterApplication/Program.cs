using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Serilog;
using Serilog.Events;
using dotenv;

namespace OptimaJet.DWKit.StarterApplication
{
    public class Program
    {
        public static void Main(string[] args)
        {
            dotenv.net.DotEnv.Config(false, ".env.dev");
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            var port = Environment.GetEnvironmentVariable("PORT");

            System.Console.WriteLine(Environment.GetEnvironmentVariable("ConnectionStrings__default"));

            if (port == null)
            {
                port = "48801";
            }

             Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .CreateLogger();


            var host = new WebHostBuilder()
                .UseKestrel()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseStartup<Startup>()
                .UseApplicationInsights()
                .UseUrls("http://0.0.0.0:" + port)
                .UseSerilog()
                .Build();

            return host;
        }
    }
}
