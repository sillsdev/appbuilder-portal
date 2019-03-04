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
        where TEntity : Identifiable<int>
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
    public class BaseHookNotifier<TEntity, TKey> : IEntityHookHandler<TEntity, TKey> where TEntity : Identifiable<TKey>
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
            var idType = typeof(TEntity)
                .GetProperties()
                .Where(p => p.Name.Equals("Id"))
                .FirstOrDefault()
                ?.PropertyType;


            dynamic idInEntityType; // Guid | int | string

            if (idType == typeof(Guid)) {
                idInEntityType = Guid.Parse(id);
            } else {
                idInEntityType = System.Convert.ChangeType(id, idType);
            }
            
            var entity = DbContext.Set<TEntity>().Find(idInEntityType);

            // entity does not exist
            // TODO: handle deletion
            if (entity == null)
            {
                return;
            }

            this.PublishResource(entity, operation);
        }

        private void PublishResource(TEntity resource, string operation)
        {
            var graphNode = this._resourceGraph.GetContextEntity(resource.GetType());

            // resource may not be in the context graph
            // (non-api model)
            if (graphNode == null)
            {
                return;
            }

            // potential groups the user could be subscribed to.
            // this is why this doesn't yet suppor the `include` notation
            // because we need to figure out how to get a _list_ of groups that the 
            // user is subscribed to and check substrings within each of those.
            //
            // at this time, I don't know if there is a way to get a list of groups.
            var entityType = graphNode.EntityName;
            var pathForGet = $"{entityType}/{resource.Id}";

            // The { json:api } formatted string / document
            // TODO: send an operations document so that we know what event happened.
            var document = this._documentBuilder.Build(resource);
            var operationsPayload = new
            {
                Operations = new
                {
                    Op = JsonApiOpForOperation(operation),
                    Data = document.Data
                }
            };

            // TODO: Orbit doesn't yet know how to process operations payloads
            var json = this._serializer.Serialize(document);

            // send to any who are subscribed...
            this.DataHub.Clients.Group(entityType).SendAsync(JSONAPIHub.RemoteDataHasUpdated, json);
            this.DataHub.Clients.Group(pathForGet).SendAsync(JSONAPIHub.RemoteDataHasUpdated, json);
        }

        private string JsonApiOpForOperation(string operation)
        {
            switch (operation)
            {
                case Insert: return "add";
                case Update: return "update";
                case Delete: return "remove";
                default: return "get";
            }
        }
    }
}
