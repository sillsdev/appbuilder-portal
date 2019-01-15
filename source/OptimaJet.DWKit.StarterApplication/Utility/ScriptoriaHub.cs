using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ScriptoriaHub : Hub
    {
        public ScriptoriaHub()
        { 
        }
        public async Task SubscribeToGroupAsync(string groupName, string auth0Id)
        {
            await Groups.AddToGroupAsync(auth0Id, groupName);
        }
        public async Task UnsubscribeFromGroupAsync(string groupName, string auth0Id)
        {
            await Groups.RemoveFromGroupAsync(auth0Id, groupName);
        }
    }
}
