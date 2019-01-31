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
    public class StatusUpdateService
    {
        public IBackgroundJobClient HangfireClient { get; }
        public IHubContext<ScriptoriaHub> HubContext { get; }
        public String ConnectionString { get; set; }
        protected IJobCancellationToken CancellationToken { get; set; }
        protected NpgsqlConnection Connection { get; set; }
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
            Log.Information($"StatusUpdateService::SendStatusUpdate: {message}");
            dynamic messageObj = JsonConvert.DeserializeObject(message);
            var tableName = messageObj.table.Value as string;
            var id = messageObj.id.Value as string;
            var groupName = "/" + tableName + "/" + id;
            await HubContext.Clients.Group(groupName).SendAsync("StatusUpdate", message);
        }
        public async Task ListenForNotifications()
        {
            Log.Information($"StatusUpdateService::ListenForNotifications: Start");

            Connection.Notification += PostgresNotificationReceived;
            Connection.StateChange += PostgresStateChange;
            while (true)
            {
                // wait until an asynchronous PostgreSQL notification arrives...
                CancellationToken.ThrowIfCancellationRequested();
                await Connection.WaitAsync(CancellationToken.ShutdownToken);

                if (Connection.FullState == System.Data.ConnectionState.Closed)
                {
                    break;
                }
            }
            Log.Information($"StatusUpdateService::ListenForNotifications: End");
        }

        private NpgsqlConnection Connect()
        {
            // For log running connections, use keepalive
            // https://www.npgsql.org/doc/wait.html
            // https://www.npgsql.org/doc/keepalive.html
            NpgsqlConnection conn = new NpgsqlConnection(ConnectionString + ";Keepalive=5");
            conn.Open();
            var listenCommand = conn.CreateCommand();
            listenCommand.CommandText = $"listen db_notifications;";
            listenCommand.ExecuteNonQuery();
            return conn;
        }

        void PostgresStateChange(object sender, System.Data.StateChangeEventArgs e)
        {
            Log.Information($"StatusUpdateService::StateChange state={e.CurrentState.ToString()}");
            if (e.CurrentState == System.Data.ConnectionState.Closed)
            {
                Log.Warning($"DB Connection Closed: Retry Job!");
                HangfireClient.Enqueue<StatusUpdateService>(s => s.ExecuteAsync(ConnectionString, CancellationToken));
            }
        }

        private void PostgresNotificationReceived(object sender, NpgsqlNotificationEventArgs e)
        {
            string message = e.AdditionalInformation.ToString();
            SendStatusUpdateAsync(message).Wait();
        }

        protected async Task ExecuteAsync(String connectionString, IJobCancellationToken cancellationToken)
        {
            this.CancellationToken = cancellationToken ?? throw new ArgumentNullException(nameof(cancellationToken));
            this.ConnectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
            this.Connection = Connect();

            await Task.Run(() => ListenForNotifications());
        }
    }
}
