using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Builders;
using JsonApiDotNetCore.Configuration;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Internal.Generics;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Models.Operations;
using JsonApiDotNetCore.Serialization;
using JsonApiDotNetCore.Services;
using JsonApiDotNetCore.Services.Operations;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using OptimaJet.DWKit.StarterApplication.Utility;
using OptimaJet.DWKit.StarterApplication.Utility.Extensions.EntityFramework;

namespace OptimaJet.DWKit.StarterApplication.EventDispatcher.EntityEventHandler
{
    public class BaseHookNotifier<TEntity> : BaseHookNotifier<TEntity, int> 
        where TEntity : class, IIdentifiable<int>
    {
        public BaseHookNotifier(
            IOperationsProcessor operationsProcessor,
            IJsonApiSerializer serializer,
            IResourceGraph resourceGraph,
            IDbContextResolver dbContextResolver,
            IHubContext<ScriptoriaHub> hubContext,
            IHubContext<JSONAPIHub> dataHub
            ) : base(operationsProcessor, serializer, resourceGraph, dbContextResolver, hubContext, dataHub)
        {

        }

    }
    public class BaseHookNotifier<TEntity, TKey> : IEntityHookHandler<TEntity, TKey> 
        where TEntity : class, IIdentifiable<TKey>
    {
        private const string Insert = "INSERT";
        private const string Update = "UPDATE";
        private const string Delete = "DELETE";

        public DbContext DbContext { get; }
        public IHubContext<ScriptoriaHub> HubContext { get; }
        public IHubContext<JSONAPIHub> DataHub { get; }

        private readonly IOperationsProcessor _operationsProcessor;
        private readonly IJsonApiSerializer _serializer;
        private readonly IResourceGraph _resourceGraph;
        private readonly IDocumentBuilder _documentBuilder;

        public BaseHookNotifier(
            IOperationsProcessor operationsProcessor,
            IJsonApiSerializer serializer,
            IResourceGraph resourceGraph,
            IDbContextResolver dbContextResolver,
            IHubContext<ScriptoriaHub> hubContext,
            IHubContext<JSONAPIHub> dataHub
            )
        {
            this.DbContext = dbContextResolver.GetContext();
            this.HubContext = hubContext;
            this.DataHub = dataHub;

            this._operationsProcessor = operationsProcessor;
            this._serializer = serializer;
            this._resourceGraph = resourceGraph;

            var jsonApiContext = new JsonApiContext(
                resourceGraph: this._resourceGraph,
                httpContextAccessor: null,
                options: new JsonApiOptions(),
                metaBuilder: new MetaBuilder(),
                genericProcessorFactory: null,
                queryParser: null,
                controllerContext: null
            )
            {
                PageManager = new PageManager
                {
                    DefaultPageSize = 20,
                    CurrentPage = 0,
                    PageSize = 20
                }
            };
            this._documentBuilder = new DocumentBuilder(jsonApiContext, null);
        }

        public string GetTableName()
        {
            return this.DbContext.GetTableName(typeof(TEntity));
        }

        public virtual void DidDelete(string id)
        {
            this.NotifyOperation(id, Delete);
        }

        public virtual void DidInsert(string id)
        {
            this.NotifyOperation(id, Insert);
        }

        public virtual void DidUpdate(string id)
        {
            this.NotifyOperation(id, Update);
        }

        public void NotifyOperation(string id, string operation)
        {
            object idInEntityType; // Guid | int | string

            if (typeof(TKey) == typeof(Guid)) {
                idInEntityType = Guid.Parse(id);
            } else {
                idInEntityType = System.Convert.ChangeType(id, typeof(TKey));
            }
            
            var entity = DbContext.Set<TEntity>().Find((TKey)idInEntityType);

            this.PublishResource((TKey)idInEntityType, entity, operation);
        }


        //
        private void PublishResource(TKey id, TEntity resource, string operation)
        {
            var graphNode = this._resourceGraph.GetContextEntity(typeof(TEntity));

            // resource may not be in the context graph
            // (non-api model)
            if (graphNode == null)
            {
                return;
            }

            // Hitting this could be there is a race condition between
            // when the job to Notify was published and the deletion
            // of the resource. (Resource not found, was deleted after job queueing)
            if (operation != Delete && resource == null) {
                return;
            }

            // potential groups the user could be subscribed to.
            // this is why this doesn't yet suppor the `include` notation
            // because we need to figure out how to get a _list_ of groups that the 
            // user is subscribed to and check substrings within each of those.
            //
            // at this time, I don't know if there is a way to get a list of groups.
            var entityType = graphNode.EntityName;
            var pathForGet = $"{entityType}/{id}";

            // The { json:api } formatted string / document
            string json;

            if (operation == Delete) {
                var operationsPayload = new OperationsDocument(
                    new List<Operation>
                    {
                        new Operation
                        {
                            Op = JsonApiOpForOperation(operation),
                            Ref = new ResourceReference {
                                Id = id.ToString(),
                                Type = entityType
                            }
                        }
                    }
                );

                json = this._serializer.Serialize(operationsPayload);
            } else {
                var document = this._documentBuilder.Build(resource);
                var operationsPayload = new OperationsDocument(
                    new List<Operation>
                    {
                        new Operation
                        {
                            Op = JsonApiOpForOperation(operation),
                            Data = document.Data
                        }
                    }
                );

                json = this._serializer.Serialize(operationsPayload);
            }

            // send to any who are subscribed...
            this.DataHub.Clients.Group(entityType).SendAsync(JSONAPIHub.RemoteDataHasUpdated, json);
            this.DataHub.Clients.Group(pathForGet).SendAsync(JSONAPIHub.RemoteDataHasUpdated, json);
        }

        private OperationCode JsonApiOpForOperation(string operation)
        {
            switch (operation)
            {
                case Insert: return OperationCode.add;
                case Update: return OperationCode.update;
                case Delete: return OperationCode.remove;
                default: return OperationCode.get;
            }
        }
    }
}
