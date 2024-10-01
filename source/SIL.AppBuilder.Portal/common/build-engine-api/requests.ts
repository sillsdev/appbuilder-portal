import prisma from '../prisma.js';
import * as Types from './types.js';

export async function request(
  resource: string,
  organizationId: number,
  method: string = 'GET',
  body?: any
) {
  const { url, token } = await getURLandToken(organizationId);
  return await fetch(`${url}/${resource}`, {
    method: method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
}
export async function getURLandToken(organizationId: number) {
  const org = await prisma.organizations.findUnique({
    where: {
      Id: organizationId
    },
    select: {
      BuildEngineUrl: true,
      BuildEngineApiAccessToken: true,
      UseDefaultBuildEngine: true
    }
  });

  return org.UseDefaultBuildEngine
    ? {
        url: process.env.DEFAULT_BUILDENGINE_URL,
        token: process.env.DEFAULT_BUILDENGINE_API_ACCESS_TOKEN
      }
    : {
        url: org.BuildEngineUrl,
        token: org.BuildEngineApiAccessToken
      };
}

export async function systemCheck(organizationId: number) {
  return (await request('system/check', organizationId)).status;
}

export async function createProject(
  organizationId: number,
  project: Types.ProjectConfig
): Promise<Types.ProjectResponse | Types.ErrorResponse> {
  const res = await request('project', organizationId, 'POST', project);
  return res.ok
    ? ((await res.json()) as Types.ProjectResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function getProjects(
  organizationId: number
): Promise<Types.ProjectResponse[] | Types.ErrorResponse> {
  const res = await request('project', organizationId);
  return res.ok
    ? ((await res.json()) as Types.ProjectResponse[])
    : ((await res.json()) as Types.ErrorResponse);
}
export async function getProject(
  organizationId: number,
  projectId: number
): Promise<Types.ProjectResponse | Types.ErrorResponse> {
  const res = await request(`project/${projectId}`, organizationId);
  return res.ok
    ? ((await res.json()) as Types.ProjectResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function deleteProject(organizationId: number, projectId: number): Promise<number> {
  const res = await request(`project/${projectId}`, organizationId, 'DELETE');
  return res.status;
}

export async function getProjectAccessToken(
  organizationId: number,
  projectId: number,
  token: Types.TokenConfig
): Promise<Types.TokenResponse | Types.ErrorResponse> {
  const res = await request(`project/${projectId}/token`, organizationId, 'POST', token);
  return res.ok
    ? ((await res.json()) as Types.TokenResponse)
    : ((await res.json()) as Types.ErrorResponse);
}

export async function createJob(
  organizationId: number,
  job: Types.JobConfig
): Promise<Types.JobResponse | Types.ErrorResponse> {
  const res = await request('job', organizationId, 'POST', job);
  return res.ok
    ? ((await res.json()) as Types.JobResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function getJobs(
  organizationId: number
): Promise<Types.JobResponse[] | Types.ErrorResponse> {
  const res = await request('job', organizationId);
  return res.ok
    ? ((await res.json()) as Types.JobResponse[])
    : ((await res.json()) as Types.ErrorResponse);
}
export async function getJob(
  organizationId: number,
  jobId: number
): Promise<Types.JobResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}`, organizationId);
  return res.ok
    ? ((await res.json()) as Types.JobResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function deleteJob(organizationId: number, jobId: number): Promise<number> {
  const res = await request(`job/${jobId}`, organizationId, 'DELETE');
  return res.status;
}

export async function createBuild(
  organizationId: number,
  jobId: number,
  build: Types.BuildConfig
): Promise<Types.BuildResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build`, organizationId, 'POST', build);
  return res.ok
    ? ((await res.json()) as Types.BuildResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function getBuild(
  organizationId: number,
  jobId: number,
  buildId: number
): Promise<Types.BuildResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build/${buildId}`, organizationId);
  return res.ok
    ? ((await res.json()) as Types.BuildResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function getBuilds(
  organizationId: number,
  jobId: number
): Promise<Types.BuildResponse[] | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build`, organizationId);
  return res.ok
    ? ((await res.json()) as Types.BuildResponse[])
    : ((await res.json()) as Types.ErrorResponse);
}
export async function deleteBuild(
  organizationId: number,
  jobId: number,
  buildId: number
): Promise<number> {
  const res = await request(`job/${jobId}/build/${buildId}`, organizationId, 'DELETE');
  return res.status;
}

export async function createRelease(
  organizationId: number,
  jobId: number,
  buildId: number,
  release: Types.ReleaseConfig
): Promise<Types.ReleaseResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build/${buildId}`, organizationId, 'PUT', release);
  return res.ok
    ? ((await res.json()) as Types.ReleaseResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function getRelease(
  organizationId: number,
  jobId: number,
  buildId: number,
  releaseId: number
): Promise<Types.ReleaseResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build/${buildId}/release/${releaseId}`, organizationId);
  return res.ok
    ? ((await res.json()) as Types.ReleaseResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function deleteRelease(
  organizationId: number,
  jobId: number,
  buildId: number,
  releaseId: number
): Promise<number> {
  const res = await request(
    `job/${jobId}/build/${buildId}/release/${releaseId}`,
    organizationId,
    'DELETE'
  );
  return res.status;
}
