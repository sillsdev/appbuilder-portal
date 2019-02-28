using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Serialization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using OptimaJet.DWKit.StarterApplication.Utility;
using OptimaJet.DWKit.StarterApplication.Utility.Extensions.EntityFramework;

namespace OptimaJet.DWKit.StarterApplication.EventDispatcher.EntityEventHandler
{
    public class BaseHookNotifier<TEntity> : IEntityHookHandler<TEntity> where TEntity : Identifiable
    {
        private const string Insert = "INSERT";
        private const string Update = "UPDATE";
        private const string Delete = "DELETE";

        public DbContext DbContext { get; }
        public IHubContext<ScriptoriaHub> HubContext { get; }
        public IHubContext<JSONAPIHub> DataHub { get; }
        public IJsonApiSerializer DataSerializer { get; }

        public BaseHookNotifier(
            IDbContextResolver dbContextResolver,
            IHubContext<ScriptoriaHub> hubContext,
            IHubContext<JSONAPIHub> dataHub,
            IJsonApiSerializer dataSerializer
            )
        {
            DbContext = dbContextResolver.GetContext();
            HubContext = hubContext;
            DataHub = dataHub;
            DataSerializer = dataSerializer;
        }

        public string GetTableName()
        {
            return DbContext.GetTableName(typeof(TEntity));
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

            var entity = DbContext.Set<TEntity>().Find(id);

            (this.DataHub as JSONAPIHub).PublishResource(entity);
        }
    }
}
