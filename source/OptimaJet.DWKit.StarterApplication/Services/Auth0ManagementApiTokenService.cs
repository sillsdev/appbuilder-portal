using System;
using static OptimaJet.DWKit.StarterApplication.Utility.EnvironmentHelpers;
using RestSharp;
using Newtonsoft.Json.Linq;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class Auth0ManagementApiTokenService
    {
        private string token;
        public Auth0ManagementApiTokenService()
        {
        }

        public string Token
        {
            get
            {
                if (token == null) {
                    var domainUrl = GetVarOrThrow("AUTH0_DOMAIN");
                    var clientId = GetVarOrDefault("AUTH0_TOKEN_ACCESS_CLIENT_ID", "");
                    var clientSecret = GetVarOrDefault("AUTH0_TOKEN_ACCESS_CLIENT_SECRET", "");
                    var client = new RestClient($"{domainUrl}/oauth/token");
                    var request = new RestRequest(Method.POST);
                    request.AddHeader("content-type", "application/json");
                    request.AddParameter("application/json", $"{{\"grant_type\":\"client_credentials\",\"client_id\": \"{clientId}\",\"client_secret\": \"{clientSecret}\",\"audience\": \"{domainUrl}/api/v2/\"}}", ParameterType.RequestBody);
                    IRestResponse response = client.Execute(request);
                    if (response.IsSuccessful)
                    {
                        dynamic json = JObject.Parse(response.Content);
                        token = json.access_token;
                    }
                    else 
                    {
                        Log.Error($"Failed to request token from Auth0: Status={response.StatusDescription}, Content={response.Content}");
                    }
                }
                return token;
            }
        }
    }
}
