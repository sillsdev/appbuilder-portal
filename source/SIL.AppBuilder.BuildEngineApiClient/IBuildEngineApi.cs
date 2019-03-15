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
        TokenResponse GetProjectAccessToken(int projectId, TokenRequest tokenRequest);
        JobResponse CreateJob(Job job);
        JobResponse GetJob(int jobId);
        List<JobResponse> GetJobs();
        HttpStatusCode DeleteJob(int jobId);
        BuildResponse CreateBuild(int jobId, Build build);
        BuildResponse GetBuild(int jobId, int buildId);
        List<BuildResponse> GetBuilds(int jobId);
        HttpStatusCode DeleteBuild(int jobId, int buildId);
        ReleaseResponse CreateRelease(int jobId, int buildId, Release release);
        ReleaseResponse GetRelease(int jobId, int buildId, int releaseId);
        HttpStatusCode DeleteRelease(int jobId, int buildId, int releaseId);
    }
}