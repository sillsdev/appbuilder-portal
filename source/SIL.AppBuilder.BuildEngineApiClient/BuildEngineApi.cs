using System;
using System.Collections.Generic;
using RestSharp;
using RestSharp.Validation;

namespace SIL.AppBuilder.BuildEngineApiClient
{
    public class BuildEngineApi : IBuildEngineApi
    {
        protected string baseUrl;
        protected string apiAccessKey;
        protected RestClient restClient;

        public BuildEngineApi()
        {
            SimpleJson.SimpleJson.CurrentJsonSerializerStrategy = new SnakeJsonSerializerStrategy();
        }
        public BuildEngineApi(string baseUrl, string apiAccessKey) : this()
        {
            this.baseUrl = baseUrl;
            this.apiAccessKey = apiAccessKey;
            this.restClient = new RestClient(baseUrl);
        }
        public void SetEndpoint(string baseUrl, string apiAccessKey)
        {
            this.baseUrl = baseUrl;
            this.apiAccessKey = apiAccessKey;
            this.restClient = new RestClient(baseUrl);
        }

        private RestRequest CreateRequest(string resource, Method method = Method.GET)
        {
            var request = new RestRequest(resource, method);
            request.AddHeader("Authorization", $"Bearer {apiAccessKey}");
            request.AddHeader("Accept", "application/json");
            return request;
        }

        protected T Execute<T>(IRestRequest request) where T : new()
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
            //Require.Argument("UserId", project.UserId);
            //Require.Argument("GroupId", project.GroupId);
            Require.Argument("AppId", project.AppId);
            Require.Argument("ProjectName", project.ProjectName);
            Require.Argument("LanguageCode", project.LanguageCode);

            var request = CreateRequest("project", Method.POST)
                .AddJsonBody(project);
            return Execute<ProjectResponse>(request);
        }
        public List<ProjectResponse> GetProjects()
        {
            var request = CreateRequest("project");
            return Execute<List<ProjectResponse>>(request);
        }

        public ProjectResponse GetProject(int projectId)
        {
            var request = CreateRequest("project/{projectId}")
                .AddParameter("projectId", projectId, ParameterType.UrlSegment);
            return Execute<ProjectResponse>(request);
        }

        public System.Net.HttpStatusCode DeleteProject(int projectId)
        {
            var request = CreateRequest("project/{projectId}", Method.DELETE)
                .AddParameter("projectId", projectId, ParameterType.UrlSegment);
            var response = restClient.Execute(request);
            return response.StatusCode;
        }

        public TokenResponse GetProjectAccessToken(int projectId, TokenRequest tokenRequest)
        {
            var request = CreateRequest("project/{projectId}/token", Method.POST)
                .AddParameter("projectId", projectId, ParameterType.UrlSegment)
                .AddJsonBody(tokenRequest);
            var response = Execute<TokenResponse>(request);
            return response;
        }
        public JobResponse CreateJob(Job job)
        {
            Require.Argument("RequestId", job.RequestId);
            Require.Argument("GitUrl", job.GitUrl);
            Require.Argument("AppId", job.AppId);
            Require.Argument("PublisherId", job.PublisherId);

            var request = CreateRequest("job", Method.POST)
                .AddJsonBody(job);
            return Execute<JobResponse>(request);
        }
        public List<JobResponse> GetJobs()
        {
            var request = CreateRequest("job");
            return Execute<List<JobResponse>>(request);
        }
        public JobResponse GetJob(int jobId)
        {
            var request = CreateRequest("job/{jobId}")
                .AddParameter("jobId", jobId, ParameterType.UrlSegment);
            return Execute<JobResponse>(request);
        }
        public System.Net.HttpStatusCode DeleteJob(int jobId)
        {
            var request = CreateRequest("job/{jobId}", Method.DELETE)
                .AddParameter("jobId", jobId, ParameterType.UrlSegment);
            var response = restClient.Execute(request);
            return response.StatusCode;
        }
        public BuildResponse CreateBuild(int jobId, Build build)
        {
            var request = CreateRequest("job/{jobId}/build", Method.POST)
                .AddJsonBody(build)
                .AddParameter("jobId", jobId, ParameterType.UrlSegment);
            return Execute<BuildResponse>(request);
        }
        public BuildResponse GetBuild(int jobId, int buildId)
        {
            var request = CreateRequest("job/{jobId}/build/{buildId}")
                .AddParameter("jobId", jobId, ParameterType.UrlSegment)
                .AddParameter("buildId", buildId, ParameterType.UrlSegment);
            return Execute<BuildResponse>(request);
        }
        public List<BuildResponse> GetBuilds(int jobId)
        {
            var request = CreateRequest("job/{jobId}/build")
                .AddParameter("jobId", jobId, ParameterType.UrlSegment);
            return Execute<List<BuildResponse>>(request);
        }
        public System.Net.HttpStatusCode DeleteBuild(int jobId, int buildId)
        {
            var request = CreateRequest("job/{jobId}/build/{buildId}", Method.DELETE)
                .AddParameter("jobId", jobId, ParameterType.UrlSegment)
                .AddParameter("buildId", buildId, ParameterType.UrlSegment);
            var response = restClient.Execute(request);
            return response.StatusCode;
        }
        public ReleaseResponse CreateRelease(int jobId, int buildId, Release release)
        {
            Require.Argument("Channel", release.Channel);
            var request = CreateRequest("job/{jobId}/build/{buildId}", Method.PUT)
                .AddJsonBody(release)
                .AddParameter("jobId", jobId, ParameterType.UrlSegment)
                .AddParameter("buildId", buildId, ParameterType.UrlSegment);
            return Execute<ReleaseResponse>(request);
        }
        public ReleaseResponse GetRelease(int jobId, int buildId, int releaseId)
        {
            var request = CreateRequest("job/{jobId}/build/{buildId}/release/{releaseId}")
                .AddParameter("jobId", jobId, ParameterType.UrlSegment)
                .AddParameter("buildId", buildId, ParameterType.UrlSegment)
                .AddParameter("releaseId", releaseId, ParameterType.UrlSegment);
            return Execute<ReleaseResponse>(request);
        }
        public System.Net.HttpStatusCode DeleteRelease(int jobId, int buildId, int releaseId)
        {
            var request = CreateRequest("job/{jobId}/build/{buildId}/release/{releaseId}", Method.DELETE)
                .AddParameter("jobId", jobId, ParameterType.UrlSegment)
                .AddParameter("buildId", buildId, ParameterType.UrlSegment)
                .AddParameter("releaseId", releaseId, ParameterType.UrlSegment);
            var response = restClient.Execute(request);
            return response.StatusCode;
        }
    }
}
