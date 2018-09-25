using System.Collections.Generic;
using System.Net;
using RestSharp;

namespace SIL.AppBuilder.BuildEngineApiClient
{
    public interface IBuildEngineApi
    {
        void SetEndpoint(string baseUrl, string apiAccessKey);
        HttpStatusCode SystemCheck();
        ProjectResponse CreateProject(Project project);
        ProjectResponse GetProject(int projectId);
        List<ProjectResponse> GetProjects();
        HttpStatusCode DeleteProject(int projectId);
    }
}