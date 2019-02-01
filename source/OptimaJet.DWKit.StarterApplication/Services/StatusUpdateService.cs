using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Utility;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class StatusUpdateService
    {
        protected static string Insert = "INSERT";
        protected static string Update = "UPDATE";
        protected static string Delete = "DELETE";

        public IHubContext<ScriptoriaHub> HubContext { get; }
        public DbContext DbContext { get; }
        public StatusUpdateService(
            IHubContext<ScriptoriaHub> hubContext,
            IDbContextResolver contextResolver
        )
        {
            HubContext = hubContext;
            DbContext = contextResolver.GetContext();
        }

        public void OnInsert(IStatusUpdate entity)
        {
            ChangesSaved(entity, Insert);
        }

        public void OnUpdate(IStatusUpdate entity)
        {
            ChangesSaved(entity, Update);
        }

        public void OnDelete(IStatusUpdate entity)
        {
            ChangesSaved(entity, Delete);
        }

        protected void ChangesSaved(IStatusUpdate entity, string operation)
        {
            if (entity == null) return;

            var id = entity.StringId;
            if (string.IsNullOrEmpty(id)) return;

            var tableName = DbContext.Model.FindEntityType(entity.GetType()).Relational().TableName;
            if (tableName == null) return;

            dynamic message = new ExpandoObject();
            message.table = tableName;
            message.id = id;
            message.operation = operation;

            var updateGroups = new string[] { $"/{tableName}", $"/{tableName}/{id}" };
            var json = JsonConvert.SerializeObject(message);
            SendStatusUpdateAsync(updateGroups, json).Wait();
        }

        public async Task SendStatusUpdateAsync(IEnumerable<string>updateGroups, string message)
        {
            foreach (var groupName in updateGroups)
            {
                await HubContext.Clients.Group(groupName).SendAsync("StatusUpdate", message);
            }
        }
    }
}
