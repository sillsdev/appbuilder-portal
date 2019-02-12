using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using OptimaJet.DWKit.StarterApplication.Utility;
using OptimaJet.DWKit.StarterApplication.Utility.Extensions.EntityFramework;

namespace OptimaJet.DWKit.StarterApplication.EventDispatcher.EntityEventHandler
{
    public class BaseHookNotifier<TEntity> : IEntityHookHandler<TEntity> where TEntity : class, IIdentifiable
    {
        private const string Insert = "INSERT";
        private const string Update = "UPDATE";
        private const string Delete = "DELETE";

        public DbContext DbContext { get; }
        public IHubContext<ScriptoriaHub> HubContext { get; }

        public BaseHookNotifier(
            IDbContextResolver dbContextResolver,
            IHubContext<ScriptoriaHub> hubContext
            )
        {
            DbContext = dbContextResolver.GetContext();
            HubContext = hubContext;
        }

        public string GetTableName()
        {
            return DbContext.GetTableName(typeof(TEntity));
        }

        public virtual IEnumerable<string> GetUpdateGroups(string tableName, string id)
        {
            return new string[] { $"/{tableName}/{id}" };
        }

        public virtual void DidDelete(string id)
        {
            NotifyOperation(id, Delete);
        }

        public virtual void DidInsert(string id)
        {
            NotifyOperation(id, Insert);
        }

        public virtual void DidUpdate(string id)
        {
            NotifyOperation(id, Update);
        }

        public void NotifyOperation(string id, string operation)
        {
            var tableName = GetTableName();

            dynamic message = new ExpandoObject();
            message.table = tableName;
            message.id = id;
            message.operation = operation;

            var updateGroups = GetUpdateGroups(tableName, id);
            var json = JsonConvert.SerializeObject(message);
            SendStatusUpdateAsync(updateGroups, json).Wait();
        }

        public async Task SendStatusUpdateAsync(IEnumerable<string> updateGroups, string message)
        {
            foreach (var groupName in updateGroups)
            {
                await HubContext.Clients.Group(groupName).SendAsync("StatusUpdate", message);
            }
        }

    }
}
