using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Models.Operations;
using JsonApiDotNetCore.Serialization;
using JsonApiDotNetCore.Services.Operations;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using Serilog;
using Serilog.Events;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    // TODO: connections should probably live in redis or something to help with multi-server
    //       concurrency.  This may not be needed for a while though -- depends on how resource heavy 
    //       this api is.
    // 
    // https://docs.microsoft.com/en-us/aspnet/signalr/overview/guide-to-the-api/mapping-users-to-connections
    public class ConnectionMapping<T>
    {
        private readonly Dictionary<T, HashSet<string>> _connections =
            new Dictionary<T, HashSet<string>>();

        public int Count
        {
            get
            {
                return _connections.Count;
            }
        }

        public void Add(T key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    connections = new HashSet<string>();
                    _connections.Add(key, connections);
                }

                lock (connections)
                {
                    connections.Add(connectionId);
                }
            }
        }

        public IEnumerable<string> GetConnections(T key)
        {
            HashSet<string> connections;
            if (_connections.TryGetValue(key, out connections))
            {
                return connections;
            }

            return Enumerable.Empty<string>();
        }

        public void Remove(T key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    return;
                }

                lock (connections)
                {
                    connections.Remove(connectionId);

                    if (connections.Count == 0)
                    {
                        _connections.Remove(key);
                    }
                }
            }
        }
    }


    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class JSONAPIHub : Hub
    {
        public static string RemoteDataHasUpdated = "RemoteDataHasUpdated";

        private readonly static ConnectionMapping<string> _connections = 
            new ConnectionMapping<string>();

        private readonly IOperationsProcessor _operationsProcessor;
        private readonly AppDbContext _db;

        public JSONAPIHub(IOperationsProcessor operationsProcessor, AppDbContext db)
        {
            this._operationsProcessor = operationsProcessor;
            this._db = db;
        }
        
        public static async Task SendTo(IHubContext<JSONAPIHub> hub, string userId, string message)
        {
            foreach (var connectionId in _connections.GetConnections(userId))
            {
                await hub.Clients.Client(connectionId).SendAsync(JSONAPIHub.RemoteDataHasUpdated, message);
            }
        }

        public override Task OnConnectedAsync()
        {
            var connectedUserId = GetConnectedUserId();
            if (connectedUserId != null)
            {
                _connections.Add(connectedUserId, Context.ConnectionId);
            }
            
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            var connectedUserId = GetConnectedUserId();
            if (connectedUserId != null)
            {
                _connections.Remove(connectedUserId, Context.ConnectionId);
            }
            
            return base.OnDisconnectedAsync(exception);
        }

        // example paths:
        // projects
        // projects/1
        //
        // To be supported
        // projects/1?include=....
        //  -- project and any related resource would also be 
        //     sent to the connection
        public async Task SubscribeTo(string path)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, path);
        }
        public async Task UnsubscribeFrom(string path)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, path);
        }

        // https://github.com/json-api/json-api/blob/999e6df77b28549d6c37b163b73c8e9102400020/_format/1.1/index.md#-processing-operations
        public async Task<string> PerformOperations(string json)
        {
            var document = JsonConvert.DeserializeObject<OperationsDocument>(json);

            // { json:api } operations requires that we use GUIDs for ids so that
            // relationships can be properly mapped in a request between multiple 
            // records. Most of our models do not use GUIDs, so for those that do
            // not, we need to delete the ID field for any 'add' operations.
            document.Operations.ForEach(operation => {
                if (operation.Op == OperationCode.add) {
                    (operation.Data as dynamic).Id = null;
                }
            });

            var results = await this._operationsProcessor.ProcessAsync(document.Operations);

            var response = new OperationsDocument(results);

            return JsonConvert.SerializeObject(response);
        }

        private string GetConnectedUserId() 
        {
            var auth0Id = Context.User.Claims.FirstOrDefault(c => c.Type == HttpContextHelpers.TYPE_NAME_IDENTIFIER)?.Value;
            
            if (auth0Id == null) {
                return null;
            }

        
            var currentUser = this._db.Users
                .Where(user => user.ExternalId == auth0Id)
                .FirstOrDefault();

            return currentUser != null ? currentUser.Id.ToString() : null;
        }
    }
}
