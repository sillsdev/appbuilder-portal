using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Npgsql;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Utility;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class StatusUpdateService
    {
        public IBackgroundJobClient HangfireClient { get; }
        public IHubContext<ScriptoriaHub> HubContext { get; }
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
        public void ListenForNotifications(string connectionString)
        {
            NpgsqlConnection conn = new NpgsqlConnection(connectionString);
            conn.Open();
            var listenCommand = conn.CreateCommand();
            listenCommand.CommandText = $"listen db_notifications;";
            listenCommand.ExecuteNonQuery();

            conn.Notification += PostgresNotificationReceived;
            while (true)
            {
                // wait until an asynchronous PostgreSQL notification arrives...
                conn.Wait();
            }
        }
        private void PostgresNotificationReceived(object sender, NpgsqlNotificationEventArgs e)
        {
            string message = e.AdditionalInformation.ToString();
            SendStatusUpdateAsync(message).Wait();
        }

    }
}
