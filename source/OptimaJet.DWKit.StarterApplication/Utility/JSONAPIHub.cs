﻿using System;
using System.IO;
using System.Runtime.Serialization.Json;
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
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OptimaJet.DWKit.StarterApplication.Models;
using Serilog;
using Serilog.Events;

namespace OptimaJet.DWKit.StarterApplication.Utility
{

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class JSONAPIHub : Hub
    {
        public static string RemoteDataHasUpdated = "RemoteDataHasUpdated";

        private readonly IOperationsProcessor _operationsProcessor;

        public JSONAPIHub(IOperationsProcessor operationsProcessor)
        {
            this._operationsProcessor = operationsProcessor;
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
    }
}
