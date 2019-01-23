using System;
using System.Threading;
using System.Threading.Tasks;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using Npgsql;
using OptimaJet.DWKit.StarterApplication.Utility;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class StatusUpdateService : BackgroundService
    {
        public IBackgroundJobClient HangfireClient { get; }
        public IHubContext<ScriptoriaHub> HubContext { get; }
        public String ConnectionString { get; set; }
        public StatusUpdateService(
            IBackgroundJobClient hangfireClient,
            IHubContext<ScriptoriaHub> hubContext
        )
        {
            HangfireClient = hangfireClient;
            HubContext = hubContext;
        }
        public async Task SendStatusUpdateAsync(string message)
        {
            dynamic messageObj = JsonConvert.DeserializeObject(message);
            var tableName = messageObj.table.Value as string;
            var id = messageObj.id.Value as string;
            var groupName = "/" + tableName + "/" + id;
            await HubContext.Clients.Group(groupName).SendAsync("StatusUpdate", message);
        }
        public void ListenForNotifications(CancellationToken stoppingToken)
        {
            Log.Information($"ListenForNotifications: Start");

            NpgsqlConnection conn = new NpgsqlConnection(ConnectionString);
            conn.Open();
            var listenCommand = conn.CreateCommand();
            listenCommand.CommandText = $"listen db_notifications;";
            listenCommand.ExecuteNonQuery();

            conn.Notification += PostgresNotificationReceived;
            while (true)
            {
                // wait until an asynchronous PostgreSQL notification arrives...
                conn.Wait(5000);
                if (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
            }
            Log.Information($"ListenForNotifications: End");
        }
        private void PostgresNotificationReceived(object sender, NpgsqlNotificationEventArgs e)
        {
            string message = e.AdditionalInformation.ToString();
            SendStatusUpdateAsync(message).Wait();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await Task.Run(() => ListenForNotifications(stoppingToken));
        }
    }
}
