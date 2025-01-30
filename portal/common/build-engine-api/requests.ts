import prisma from '../prisma.js';
import * as Types from './types.js';

export async function request(
  resource: string,
  auth: Types.Auth,
  method: string = 'GET',
  body?: unknown
) {
  try {
    const { url, token } = auth.type === 'query' ? await getURLandToken(auth.organizationId) : auth;
    const check = await prisma.systemStatuses.findFirst({
      where: {
        BuildEngineUrl: url,
        BuildEngineApiAccessToken: token
      },
      select: {
        SystemAvailable: true
      }
    });
    if (!check?.SystemAvailable) {
      return new Response(
        JSON.stringify({
          responseType: 'error',
          name: '',
          status: 500,
          code: 500,
          message: `System ${url} unavailable`,
          type: ''
        } as Types.ErrorResponse),
        {
          status: 500,
          statusText: 'Internal Server Error'
        }
      );
    }
    return await fetch(`${url}/${resource}`, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        responseType: 'error',
        name: '',
        status: 500,
        code: 500,
        message: typeof e === 'string' ? e.toUpperCase() : e instanceof Error ? e.message : e,
        type: ''
      } as Types.ErrorResponse),
      {
        status: 500,
        statusText: 'Internal Server Error'
      }
    );
  }
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

  if (!org) {
    throw new Error(`No organization could be found with ID: ${organizationId}`);
  }

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

export async function systemCheck(auth: Types.Auth) {
  const res = await request('system/check', auth);
  return res.ok
    ? ({ status: res.status} as Types.StatusResponse)
    : ((await res.json()) as Types.ErrorResponse);
}

export async function createProject(
  auth: Types.Auth,
  project: Types.ProjectConfig
): Promise<Types.ProjectResponse | Types.ErrorResponse> {
  const res = await request('project', auth, 'POST', project);
  return res.ok
    ? ((await res.json()) as Types.ProjectResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function getProjects(
  auth: Types.Auth
): Promise<Types.ProjectResponse[] | Types.ErrorResponse> {
  const res = await request('project', auth);
  return res.ok
    ? ((await res.json()) as Types.ProjectResponse[])
    : ((await res.json()) as Types.ErrorResponse);
}
export async function getProject(
  auth: Types.Auth,
  projectId: number
): Promise<Types.ProjectResponse | Types.ErrorResponse> {
  const res = await request(`project/${projectId}`, auth);
  return res.ok
    ? ((await res.json()) as Types.ProjectResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function deleteProject(
  auth: Types.Auth,
  projectId: number
): Promise<Types.DeleteResponse | Types.ErrorResponse> {
  const res = await request(`project/${projectId}`, auth, 'DELETE');
  return res.ok
    ? { responseType: 'delete', status: res.status }
    : ((await res.json()) as Types.ErrorResponse);
}

export async function getProjectAccessToken(
  auth: Types.Auth,
  projectId: number,
  token: Types.TokenConfig
): Promise<Types.TokenResponse | Types.ErrorResponse> {
  const res = await request(`project/${projectId}/token`, auth, 'POST', token);
  return res.ok
    ? ((await res.json()) as Types.TokenResponse)
    : ((await res.json()) as Types.ErrorResponse);
}

export async function createJob(
  auth: Types.Auth,
  job: Types.JobConfig
): Promise<Types.JobResponse | Types.ErrorResponse> {
  const res = await request('job', auth, 'POST', job);
  return res.ok
    ? ((await res.json()) as Types.JobResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function getJobs(
  auth: Types.Auth
): Promise<Types.JobResponse[] | Types.ErrorResponse> {
  const res = await request('job', auth);
  return res.ok
    ? ((await res.json()) as Types.JobResponse[])
    : ((await res.json()) as Types.ErrorResponse);
}
export async function getJob(
  auth: Types.Auth,
  jobId: number
): Promise<Types.JobResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}`, auth);
  return res.ok
    ? ((await res.json()) as Types.JobResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function deleteJob(
  auth: Types.Auth,
  jobId: number
): Promise<Types.DeleteResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}`, auth, 'DELETE');
  return res.ok
    ? { responseType: 'delete', status: res.status }
    : ((await res.json()) as Types.ErrorResponse);
}

export async function createBuild(
  auth: Types.Auth,
  jobId: number,
  build: Types.BuildConfig
): Promise<Types.BuildResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build`, auth, 'POST', build);
  return res.ok
    ? ((await res.json()) as Types.BuildResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function getBuild(
  auth: Types.Auth,
  jobId: number,
  buildId: number
): Promise<Types.BuildResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build/${buildId}`, auth);
  return res.ok
    ? ((await res.json()) as Types.BuildResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function getBuilds(
  auth: Types.Auth,
  jobId: number
): Promise<Types.BuildResponse[] | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build`, auth);
  return res.ok
    ? ((await res.json()) as Types.BuildResponse[])
    : ((await res.json()) as Types.ErrorResponse);
}
export async function deleteBuild(
  auth: Types.Auth,
  jobId: number,
  buildId: number
): Promise<Types.DeleteResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build/${buildId}`, auth, 'DELETE');
  return res.ok
    ? { responseType: 'delete', status: res.status }
    : ((await res.json()) as Types.ErrorResponse);
}

export async function createRelease(
  auth: Types.Auth,
  jobId: number,
  buildId: number,
  release: Types.ReleaseConfig
): Promise<Types.ReleaseResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build/${buildId}`, auth, 'PUT', release);
  return res.ok
    ? ((await res.json()) as Types.ReleaseResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function getRelease(
  auth: Types.Auth,
  jobId: number,
  buildId: number,
  releaseId: number
): Promise<Types.ReleaseResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build/${buildId}/release/${releaseId}`, auth);
  return res.ok
    ? ((await res.json()) as Types.ReleaseResponse)
    : ((await res.json()) as Types.ErrorResponse);
}
export async function deleteRelease(
  auth: Types.Auth,
  jobId: number,
  buildId: number,
  releaseId: number
): Promise<Types.DeleteResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build/${buildId}/release/${releaseId}`, auth, 'DELETE');
  return res.ok
    ? { responseType: 'delete', status: res.status }
    : ((await res.json()) as Types.ErrorResponse);
}
