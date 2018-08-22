using System;
using System.Collections.Generic;
using RestSharp;
using RestSharp.Validation;

namespace SIL.AppBuilder.BuildEngineApiClient
{
    public class BuildEngineApi
    {
        readonly string baseUrl;
        readonly string apiAccessKey;
        readonly RestClient restClient;

        public BuildEngineApi(string baseUrl, string apiAccessKey)
        {
            this.baseUrl = baseUrl;
            this.apiAccessKey = apiAccessKey;
            this.restClient = new RestClient(baseUrl);
            SimpleJson.SimpleJson.CurrentJsonSerializerStrategy = new SnakeJsonSerializerStrategy();
        }

        private RestRequest CreateRequest(string resource, Method method = Method.GET)
        {
            var request = new RestRequest(resource, method);
            request.AddHeader("Authorization", $"Bearer {apiAccessKey}");
            request.AddHeader("Accept", "application/json");
            return request;
        }

        public T Execute<T>(IRestRequest request) where T : new()
        {
            var response = restClient.Execute<T>(request);
            if (response.ErrorException != null)
            {
                const string message = "Error retrieving response.  Check inner details for more info.";
                var buildEngineException = new Exception(message, response.ErrorException);
                throw buildEngineException;
            }

            return response.Data;
        }

        public System.Net.HttpStatusCode SystemCheck()
        {
            var request = CreateRequest("system/check");
            var response = restClient.Execute(request);
            return response.StatusCode;
        }

        public ProjectResponse CreateProject(Project project)
        {
            Require.Argument("UserId", project.UserId);
            Require.Argument("GroupId", project.GroupId);
            Require.Argument("AppId", project.AppId);
            Require.Argument("ProjectName", project.ProjectName);
            Require.Argument("LanguageCode", project.LanguageCode);
            Require.Argument("PublishingKey", project.PublishingKey);

            var request = CreateRequest("project", Method.POST)
                .AddJsonBody(project);
            return Execute<ProjectResponse>(request);
        }

        public List<ProjectResponse> GetProjects()
        {
            var request = new RestRequest("project");
            return Execute<List<ProjectResponse>>(request);
        }

        public ProjectResponse GetProject(int projectId)
        {
            var request = new RestRequest("project/{projectId}")
                .AddParameter("projectId", projectId, ParameterType.UrlSegment);
            return Execute<ProjectResponse>(request);
        }

        /// Note: This is not implemented in BuildEngine ... yet
        ///
        //public ProjectResponse UpdateProject(int projectId, object projectProperties)
        //{
        //    var request = new RestRequest("project/{projectId}", Method.PUT)
        //        .AddParameter("projectId", projectId, ParameterType.UrlSegment)
        //        .AddJsonBody(projectProperties);
        //    return Execute<ProjectResponse>(request);
        //}

        public System.Net.HttpStatusCode DeleteProject(int projectId)
        {
            var request = CreateRequest("project/{projectId}", Method.DELETE)
                .AddParameter("projectId", projectId, ParameterType.UrlSegment);
            var response = restClient.Execute(request);
            return response.StatusCode;
        }
    }
}
