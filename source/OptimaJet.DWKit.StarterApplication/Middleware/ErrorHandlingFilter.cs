using Bugsnag;
using JsonApiDotNetCore.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using OptimaJet.DWKit.StarterApplication.Exceptions;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Middleware
{
    public class ErrorHandlingFilter : ActionFilterAttribute, IExceptionFilter
    {
        private readonly IClient client;

        public ErrorHandlingFilter(IClient client)
        {
            this.client = client;
        }

        public void OnException(ExceptionContext context)
        {
            Log.Error(context.Exception, "An unhandled exception occurred during the request");
            client.Notify(context.Exception);

            var code = StatusCodes.Status500InternalServerError;

            if (context.Exception is PolicyCheckFailedException) code = StatusCodes.Status403Forbidden;

            // Note: When create the JsonApiException, it sets the status code in the Meta to 500,
            //       which is wrong but we don't have a way to change it and not worth the effort.
            //       The status code of the Result is correct so that is what counts.
            var jsonApiException = JsonApiExceptionFactory.GetException(context.Exception);

            var error = jsonApiException.GetError();
            var result = new ObjectResult(error)
            {
                StatusCode = code
            };
            context.Result = result;
        }
    }
}
