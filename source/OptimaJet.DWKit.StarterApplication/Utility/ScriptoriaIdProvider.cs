using System;
using Microsoft.AspNetCore.SignalR;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public class ScriptoriaIdProvider : IUserIdProvider
    {
        public virtual string GetUserId(HubConnectionContext connection)
        {
            var auth0Id = connection.GetHttpContext()?.GetAuth0Id();
            return auth0Id;
        }
    }
}
