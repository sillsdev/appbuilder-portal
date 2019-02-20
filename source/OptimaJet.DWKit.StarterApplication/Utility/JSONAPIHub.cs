using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Models.Operations;
using JsonApiDotNetCore.Services.Operations;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using OptimaJet.DWKit.StarterApplication.Models;
using Serilog;
using Serilog.Events;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
  [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
  public class JSONAPIHub : Hub
  {
    private readonly IOperationsProcessor _operationsProcessor;
    public JSONAPIHub(IOperationsProcessor operationsProcessor)
    {
      this._operationsProcessor = operationsProcessor;
      Log.Logger.Warning("uhhhh does this work?");
    }

    public async Task PerformOperation(dynamic someData)
    {
      var document = (OperationsDocument)someData;

      if (document == null)
      {
        // TODO: how do we return errors back?
        // in a REST world, this would be a 422 or some other error
        // I wonder if we need request-ids implemented
      }

      var results = await _operationsProcessor.ProcessAsync(document.Operations);

      var response = new OperationsDocument(results);
    }
  }
}
