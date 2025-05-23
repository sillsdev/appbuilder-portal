import { Span, trace } from '@opentelemetry/api';
import prisma from '../prisma.js';
import * as Types from './types.js';

const tracer = trace.getTracer('build-engine-api');

export async function request(resource: string, auth: Types.Auth, opts?: Types.RequestOpts) {
  return tracer.startActiveSpan('request', async (span: Span) => {
    const { method = 'GET', body, checkStatusFirst = true } = opts ?? {};
    span.setAttributes({
      method,
      resource,
      body: !!body,
      auth: auth.type
    });
    try {
      const { url, token } =
        auth.type === 'query' ? await getURLandToken(auth.organizationId) : auth;
      span.setAttribute('endpoint', url ?? '');
      if (checkStatusFirst) {
        const check = await prisma.systemStatuses.findFirst({
          where: {
            BuildEngineUrl: url,
            BuildEngineApiAccessToken: token
          },
          select: {
            SystemAvailable: true
          }
        });
        span.setAttribute('system-available', !!check?.SystemAvailable);
        if (!check?.SystemAvailable) {
          return {
            ok: false,
            status: Types.EndpointUnavailable,
            json: {
              responseType: 'error',
              name: '',
              status: Types.EndpointUnavailable,
              code: Types.EndpointUnavailable,
              message: `System ${url} unavailable`,
              type: ''
            } as Types.ErrorResponse
          };
        }
      }
      const res = await fetch(`${url}/${resource}`, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      }).then((r) => ({
        ok: r.ok,
        status: r.status,
        json: r.json()
      }));
      span.setAttribute('status', res.status);
      span.end();
      return res;
    } catch (e) {
      const err = typeof e === 'string' ? e.toUpperCase() : e instanceof Error ? e.message : e;
      span.setAttribute('error', err as string);
      span.end();
      return {
        ok: false,
        status: 500,
        json: {
          responseType: 'error',
          name: '',
          status: 500,
          code: 500,
          message: err,
          type: ''
        } as Types.ErrorResponse
      };
    }
  });
}

export function tryGetDefaultBuildEngineParameters() {
  if (!(process.env.DEFAULT_BUILDENGINE_URL || process.env.DEFAULT_BUILDENGINE_API_ACCESS_TOKEN)) {
    console.error('NO DEFAULT BUILD ENGINE URL SET (ENV.DEFAULT_BUILDENGINE_URL/DEFAULT_BUILDENGINE_API_ACCESS_TOKEN)');
    return {
      url: '',
      token: ''
    };
  }

  return {
    url: process.env.DEFAULT_BUILDENGINE_URL,
    token: process.env.DEFAULT_BUILDENGINE_API_ACCESS_TOKEN
  }
}
export async function getURLandToken(organizationId: number) {
  return tracer.startActiveSpan('auth', async (span: Span) => {
    span.setAttribute('organizationId', organizationId);
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

    span.setAttribute('exists', !!org);

    if (!org) {
      span.end();
      throw new Error(`No organization could be found with ID: ${organizationId}`);
    }
    span.setAttribute('useDefault', !!org.UseDefaultBuildEngine);
    const res = org.UseDefaultBuildEngine
      ? tryGetDefaultBuildEngineParameters()
      : {
          url: org.BuildEngineUrl,
          token: org.BuildEngineApiAccessToken
        };
    span.end();
    return res;
  });
}

function deleteResponse(status: number): Types.DeleteResponse {
  return { responseType: 'delete', status };
}

export async function systemCheck(auth: Types.Auth) {
  return tracer.startActiveSpan('systemCheck', async (span: Span) => {
    const res = await request('system/check', auth, { checkStatusFirst: false });
    span.setAttribute('status', res.status);
    span.end();
    return res.ok
      ? ({ status: res.status } as Types.StatusResponse)
      : ((await res.json) as Types.ErrorResponse);
  });
}

export async function createProject(
  auth: Types.Auth,
  project: Types.ProjectConfig
): Promise<Types.ProjectResponse | Types.ErrorResponse> {
  return tracer.startActiveSpan('createProject', async (span: Span) => {
    span.setAttributes(project);
    const res = await request('project', auth, { method: 'POST', body: project });
    span.setAttribute('status', res.status);
    return res.ok
      ? ((await res.json) as Types.ProjectResponse)
      : ((await res.json) as Types.ErrorResponse);
  });
}
export async function getProjects(
  auth: Types.Auth
): Promise<Types.ProjectResponse[] | Types.ErrorResponse> {
  return tracer.startActiveSpan('getProjects', async (span: Span) => {
    const res = await request('project', auth);
    const j = await res.json;
    span.setAttribute('projects', res.ok ? (j as any[]).length : 0);
    span.setAttribute('status', res.status);
    span.end();
    return res.ok ? (j as Types.ProjectResponse[]) : (j as Types.ErrorResponse);
  });
}
export async function getProject(
  auth: Types.Auth,
  projectId: number
): Promise<Types.ProjectResponse | Types.ErrorResponse> {
  return tracer.startActiveSpan('getProject', async (span: Span) => {
    span.setAttributes({ projectId });
    const res = await request(`project/${projectId}`, auth);
    span.setAttribute('status', res.status);
    span.end();
    return res.ok
      ? ((await res.json) as Types.ProjectResponse)
      : ((await res.json) as Types.ErrorResponse);
  });
}
export async function deleteProject(
  auth: Types.Auth,
  projectId: number
): Promise<Types.DeleteResponse | Types.ErrorResponse> {
  return tracer.startActiveSpan('deleteProject', async (span: Span) => {
    span.setAttributes({ projectId });
    const res = await request(`project/${projectId}`, auth, { method: 'DELETE' });
    span.setAttribute('status', res.status);
    span.end();
    return res.ok ? deleteResponse(res.status) : ((await res.json) as Types.ErrorResponse);
  });
}

export async function getProjectAccessToken(
  auth: Types.Auth,
  projectId: number,
  token: Types.TokenConfig
): Promise<Types.TokenResponse | Types.ErrorResponse> {
  return tracer.startActiveSpan('projectToken', async (span: Span) => {
    span.setAttributes({ projectId, ...token });
    const res = await request(`project/${projectId}/token`, auth, { method: 'POST', body: token });
    span.setAttribute('status', res.status);
    span.end();
    return res.ok
      ? ((await res.json) as Types.TokenResponse)
      : ((await res.json) as Types.ErrorResponse);
  });
}

export async function createJob(
  auth: Types.Auth,
  job: Types.JobConfig
): Promise<Types.JobResponse | Types.ErrorResponse> {
  return tracer.startActiveSpan('createJob', async (span: Span) => {
    span.setAttributes(job);
    const res = await request('job', auth, { method: 'POST', body: job });
    span.setAttribute('status', res.status);
    span.end();
    return res.ok
      ? ((await res.json) as Types.JobResponse)
      : ((await res.json) as Types.ErrorResponse);
  });
}
export async function getJobs(
  auth: Types.Auth
): Promise<Types.JobResponse[] | Types.ErrorResponse> {
  return tracer.startActiveSpan('getJobs', async (span: Span) => {
    const res = await request('job', auth);
    const j = await res.json;
    span.setAttribute('jobs', res.ok ? (j as any[]).length : 0);
    span.setAttribute('status', res.status);
    span.end();
    return res.ok ? (j as Types.JobResponse[]) : (j as Types.ErrorResponse);
  });
}
export async function getJob(
  auth: Types.Auth,
  jobId: number
): Promise<Types.JobResponse | Types.ErrorResponse> {
  return tracer.startActiveSpan('getJob', async (span: Span) => {
    span.setAttributes({ jobId });
    const res = await request(`job/${jobId}`, auth);
    span.setAttribute('status', res.status);
    span.end();
    return res.ok
      ? ((await res.json) as Types.JobResponse)
      : ((await res.json) as Types.ErrorResponse);
  });
}
export async function deleteJob(
  auth: Types.Auth,
  jobId: number
): Promise<Types.DeleteResponse | Types.ErrorResponse> {
  return tracer.startActiveSpan('deleteJob', async (span: Span) => {
    span.setAttributes({ jobId });
    const res = await request(`job/${jobId}`, auth, { method: 'DELETE' });
    span.setAttribute('status', res.status);
    span.end();
    return res.ok ? deleteResponse(res.status) : ((await res.json) as Types.ErrorResponse);
  });
}

export async function createBuild(
  auth: Types.Auth,
  jobId: number,
  build: Types.BuildConfig
): Promise<Types.BuildResponse | Types.ErrorResponse> {
  return tracer.startActiveSpan('createBuild', async (span: Span) => {
    span.setAttributes({ jobId, targets: build.targets });
    const res = await request(`job/${jobId}/build`, auth, { method: 'POST', body: build });
    span.setAttribute('status', res.status);
    span.end();
    return res.ok
      ? ((await res.json) as Types.BuildResponse)
      : ((await res.json) as Types.ErrorResponse);
  });
}
export async function getBuild(
  auth: Types.Auth,
  jobId: number,
  buildId: number
): Promise<Types.BuildResponse | Types.ErrorResponse> {
  return tracer.startActiveSpan('getBuild', async (span: Span) => {
    span.setAttributes({ jobId, buildId });
    const res = await request(`job/${jobId}/build/${buildId}`, auth);
    span.setAttribute('status', res.status);
    span.end();
    return res.ok
      ? ((await res.json) as Types.BuildResponse)
      : ((await res.json) as Types.ErrorResponse);
  });
}
export async function getBuilds(
  auth: Types.Auth,
  jobId: number
): Promise<Types.BuildResponse[] | Types.ErrorResponse> {
  return tracer.startActiveSpan('getBuilds', async (span: Span) => {
    span.setAttributes({ jobId });
    const res = await request(`job/${jobId}/build`, auth);
    const j = await res.json;
    span.setAttribute('builds', res.ok ? (j as any[]).length : 0);
    span.setAttribute('status', res.status);
    span.end();
    return res.ok ? (j as Types.BuildResponse[]) : (j as Types.ErrorResponse);
  });
}
export async function deleteBuild(
  auth: Types.Auth,
  jobId: number,
  buildId: number
): Promise<Types.DeleteResponse | Types.ErrorResponse> {
  return tracer.startActiveSpan('deleteBuild', async (span: Span) => {
    span.setAttributes({ jobId, buildId });
    const res = await request(`job/${jobId}/build/${buildId}`, auth, { method: 'DELETE' });
    span.setAttribute('status', res.status);
    span.end();
    return res.ok ? deleteResponse(res.status) : ((await res.json) as Types.ErrorResponse);
  });
}

export async function createRelease(
  auth: Types.Auth,
  jobId: number,
  buildId: number,
  release: Types.ReleaseConfig
): Promise<Types.ReleaseResponse | Types.ErrorResponse> {
  return tracer.startActiveSpan('createRelease', async (span: Span) => {
    span.setAttributes({ jobId, buildId, channel: release.channel, targets: release.targets });
    const res = await request(`job/${jobId}/build/${buildId}`, auth, {
      method: 'PUT',
      body: release
    });
    span.setAttribute('status', res.status);
    span.end();
    return res.ok
      ? ((await res.json) as Types.ReleaseResponse)
      : ((await res.json) as Types.ErrorResponse);
  });
}
export async function getRelease(
  auth: Types.Auth,
  jobId: number,
  buildId: number,
  releaseId: number
): Promise<Types.ReleaseResponse | Types.ErrorResponse> {
  return tracer.startActiveSpan('getRelease', async (span: Span) => {
    span.setAttributes({ jobId, buildId, releaseId });
    const res = await request(`job/${jobId}/build/${buildId}/release/${releaseId}`, auth);
    span.setAttribute('status', res.status);
    span.end();
    return res.ok
      ? ((await res.json) as Types.ReleaseResponse)
      : ((await res.json) as Types.ErrorResponse);
  });
}
export async function deleteRelease(
  auth: Types.Auth,
  jobId: number,
  buildId: number,
  releaseId: number
): Promise<Types.DeleteResponse | Types.ErrorResponse> {
  return tracer.startActiveSpan('deleteRelease', async (span: Span) => {
    span.setAttributes({ jobId, buildId, releaseId });
    const res = await request(`job/${jobId}/build/${buildId}/release/${releaseId}`, auth, {
      method: 'DELETE'
    });
    span.setAttribute('status', res.status);
    span.end();
    return res.ok ? deleteResponse(res.status) : ((await res.json) as Types.ErrorResponse);
  });
}
