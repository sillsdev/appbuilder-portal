using System;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ScriptoriaHub : Hub
    {
        public ScriptoriaHub()
        {
        }
    }
}
