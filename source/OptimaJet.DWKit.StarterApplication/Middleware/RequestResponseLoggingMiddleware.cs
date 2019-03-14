// https://dev.to/mckabue/an-aspnet-core-request---response-logger-middleware-clb
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;

// https://exceptionnotfound.net/using-middleware-to-log-requests-and-responses-in-asp-net-core/
// https://gist.github.com/elanderson/c50b2107de8ee2ed856353dfed9168a2
// https://stackoverflow.com/a/52328142/3563013
// https://stackoverflow.com/a/43404745/3563013
// https://gist.github.com/elanderson/c50b2107de8ee2ed856353dfed9168a2#gistcomment-2319007
public class RequestResponseLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly Action<RequestProfilerModel> _requestResponseHandler;

    public RequestResponseLoggingMiddleware(RequestDelegate next, Action<RequestProfilerModel> requestResponseHandler)
    {
        _next = next;
        _requestResponseHandler = requestResponseHandler;
    }

    public async Task Invoke(HttpContext context)
    {
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();;
        var model = new RequestProfilerModel
        {
            Context = context,
            Request = FormatRequest(context)
        };

        await _next(context);

        stopwatch.Stop();
        model.Duration = stopwatch.ElapsedMilliseconds;
        model.Status = context.Response.StatusCode;
        _requestResponseHandler(model);
    }

    private string FormatRequest(HttpContext context)
    {
        HttpRequest request = context.Request;

        return $"[{request.Method}] {request.Scheme}://" +
                $"{request.Host}{request.Path}{request.QueryString}";
    }

    public class RequestProfilerModel
    {
        public HttpContext Context { get; set; }
        public string Request { get; set; }
        public double Duration { get; set; }
        public int Status { get; internal set; }
  }
}