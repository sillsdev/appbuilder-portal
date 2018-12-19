using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Services.Operations;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize]
    [Route("api/operations")]
    public class OperationsController : JsonApiOperationsController
    {
        public OperationsController(IOperationsProcessor processor)
            : base(processor)
        { }
    }
}