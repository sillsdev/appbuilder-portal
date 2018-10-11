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
        JobResponse CreateJob(Job job);
        JobResponse GetJob(int jobId);
        List<JobResponse> GetJobs();
        HttpStatusCode DeleteJob(int jobId);
        BuildResponse CreateBuild(int jobId);
        BuildResponse GetBuild(int jobId, int buildId);
        List<BuildResponse> GetBuilds(int jobId);
        HttpStatusCode DeleteBuild(int jobId, int buildId);
    }
}