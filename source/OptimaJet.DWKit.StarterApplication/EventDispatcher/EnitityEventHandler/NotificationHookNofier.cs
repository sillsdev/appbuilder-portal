using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Serialization;
using JsonApiDotNetCore.Services.Operations;
using Microsoft.AspNetCore.SignalR;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Utility;

namespace OptimaJet.DWKit.StarterApplication.EventDispatcher.EntityEventHandler
{
    public class NotificationHookNotifier : BaseHookNotifier<Notification, int> 
    {
        public NotificationHookNotifier(
            IOperationsProcessor operationsProcessor,
            IJsonApiSerializer serializer,
            IResourceGraph resourceGraph,
            IDbContextResolver dbContextResolver,
            IHubContext<JSONAPIHub> dataHub
            ) : base(operationsProcessor, serializer, resourceGraph, dbContextResolver, dataHub)
        {

        }

        protected override async void PublishResourceAsync(int id, Notification resource, string operation) 
        {
            if (resource == null) {
              base.PublishResourceAsync(id, resource, operation);
              return;
            }

            var (json, _, _) = BuildResource(id, resource, operation);

            if (json == null) {
                return;
            }

            await JSONAPIHub.SendTo(this.DataHub, resource.UserId.ToString(), json);
        }

    }
}