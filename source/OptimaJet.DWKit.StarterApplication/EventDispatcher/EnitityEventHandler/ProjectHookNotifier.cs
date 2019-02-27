using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Serialization;
using Microsoft.AspNetCore.SignalR;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Utility;

namespace OptimaJet.DWKit.StarterApplication.EventDispatcher.EntityEventHandler
{
    public class ProjectHookNotifier : BaseHookNotifier<Project>
    {
        private IHubContext<JSONAPIHub> dataHub;

        public ProjectHookNotifier(
            IDbContextResolver dbContextResolver,
            IHubContext<ScriptoriaHub> hubContext,
            IHubContext<JSONAPIHub> dataHub,
            IJsonApiSerializer dataSerializer
        ) : base(dbContextResolver, hubContext, dataHub, dataSerializer)
        {
        }

        public override void DidUpdate(string id) {
            base.DidUpdate(id);

            var tableName = GetTableName();

            var entity = DbContext.Set<Project>().Find(id);
            var message = DataSerializer.Serialize(entity);

            var updateGroups = GetUpdateGroups(tableName, id);
            SendDataUpdateAsync(updateGroups, message).Wait();
        }
    }
}
