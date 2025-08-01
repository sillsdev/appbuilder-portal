import { SpanStatusCode, trace } from '@opentelemetry/api';
import { DatabaseReads } from '../database/prisma';
import * as Types from './types';

const tracer = trace.getTracer('build-engine-api');

export async function request(resource: string, auth: Types.Auth, opts?: Types.RequestOpts) {
  // Use the tracer to create a span for the request
  return await tracer.startActiveSpan(`request:/${resource}`, async (span) => {
    span.setAttributes({
      'auth.type': auth.type,
      'auth.organizationId': auth.type === 'query' ? auth.organizationId : undefined
    });

    span.setAttributes({
      'request.method': opts?.method ?? 'GET',
      'request.resource': resource,
      checkStatusFirst: opts?.checkStatusFirst ?? true
    });

    const { method = 'GET', body, checkStatusFirst = true } = opts ?? {};
    try {
      const { url, token } =
        auth.type === 'query' ? await getURLandToken(auth.organizationId) : auth;
      span.setAttributes({
        'auth.url': auth.type === 'provided' ? auth.url : (url ?? 'null'),
        // Replace with *s
        'auth.token': (auth.type === 'provided' ? auth.token : token)?.replace(/./g, '*') ?? 'null'
      });
      const check = await DatabaseReads.systemStatuses.findFirst({
        where: {
          BuildEngineUrl: url,
          BuildEngineApiAccessToken: token
        },
        select: {
          SystemAvailable: true
        }
      });
      span.setAttribute('systemAvailable', check?.SystemAvailable ?? false);
      if (!check?.SystemAvailable && checkStatusFirst) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'System unavailable' });
        span.end();
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
      const ret = await fetch(`${url}/${resource}`, {
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
      if (!ret.ok) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `Request failed with status ${ret.status}`
        });
      }
      span.addEvent('Request completed', {
        url: `${url}/${resource}`,
        method: method,
        status: ret.status,
        ok: ret.ok,
        json: await ret.json
      });
      span.end();
      return ret;
    } catch (e) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'Request failed' });
      span.recordException(e as Error);
      span.end();
      return {
        ok: false,
        status: 500,
        json: {
          responseType: 'error',
          name: '',
          status: 500,
          code: 500,
          message: typeof e === 'string' ? e.toUpperCase() : e instanceof Error ? e.message : e,
          type: ''
        } as Types.ErrorResponse
      };
    }
  });
}

export function tryGetDefaultBuildEngineParameters() {
  if (!(process.env.DEFAULT_BUILDENGINE_URL || process.env.DEFAULT_BUILDENGINE_API_ACCESS_TOKEN)) {
    console.error(
      'NO DEFAULT BUILD ENGINE URL SET (ENV.DEFAULT_BUILDENGINE_URL/DEFAULT_BUILDENGINE_API_ACCESS_TOKEN)'
    );
    return {
      url: '',
      token: ''
    };
  }

  return {
    url: process.env.DEFAULT_BUILDENGINE_URL,
    token: process.env.DEFAULT_BUILDENGINE_API_ACCESS_TOKEN
  };
}
export async function getURLandToken(organizationId: number) {
  const org = await DatabaseReads.organizations.findUnique({
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
    ? tryGetDefaultBuildEngineParameters()
    : {
        url: org.BuildEngineUrl,
        token: org.BuildEngineApiAccessToken
      };
}

export async function systemCheck(auth: Types.Auth) {
  const res = await request('system/check', auth, { checkStatusFirst: false });
  return res.ok
    ? ({ status: res.status } as Types.StatusResponse)
    : ((await res.json) as Types.ErrorResponse);
}

export async function createProject(
  auth: Types.Auth,
  project: Types.ProjectConfig
): Promise<Types.ProjectResponse | Types.ErrorResponse> {
  const res = await request('project', auth, { method: 'POST', body: project });
  return res.ok
    ? ((await res.json) as Types.ProjectResponse)
    : ((await res.json) as Types.ErrorResponse);
}
export async function getProjects(
  auth: Types.Auth
): Promise<Types.ProjectResponse[] | Types.ErrorResponse> {
  const res = await request('project', auth);
  return res.ok
    ? ((await res.json) as Types.ProjectResponse[])
    : ((await res.json) as Types.ErrorResponse);
}
export async function getProject(
  auth: Types.Auth,
  projectId: number
): Promise<Types.ProjectResponse | Types.ErrorResponse> {
  const res = await request(`project/${projectId}`, auth);
  return res.ok
    ? ((await res.json) as Types.ProjectResponse)
    : ((await res.json) as Types.ErrorResponse);
}
export async function deleteProject(
  auth: Types.Auth,
  projectId: number
): Promise<Types.DeleteResponse | Types.ErrorResponse> {
  const res = await request(`project/${projectId}`, auth, { method: 'DELETE' });
  return res.ok
    ? { responseType: 'delete', status: res.status }
    : ((await res.json) as Types.ErrorResponse);
}

export async function getProjectAccessToken(
  auth: Types.Auth,
  projectId: number,
  token: Types.TokenConfig
): Promise<Types.TokenResponse | Types.ErrorResponse> {
  const res = await request(`project/${projectId}/token`, auth, { method: 'POST', body: token });
  return res.ok
    ? ((await res.json) as Types.TokenResponse)
    : ((await res.json) as Types.ErrorResponse);
}

export async function createJob(
  auth: Types.Auth,
  job: Types.JobConfig
): Promise<Types.JobResponse | Types.ErrorResponse> {
  const res = await request('job', auth, { method: 'POST', body: job });
  return res.ok
    ? ((await res.json) as Types.JobResponse)
    : ((await res.json) as Types.ErrorResponse);
}
export async function getJobs(
  auth: Types.Auth
): Promise<Types.JobResponse[] | Types.ErrorResponse> {
  const res = await request('job', auth);
  return res.ok
    ? ((await res.json) as Types.JobResponse[])
    : ((await res.json) as Types.ErrorResponse);
}
export async function getJob(
  auth: Types.Auth,
  jobId: number
): Promise<Types.JobResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}`, auth);
  return res.ok
    ? ((await res.json) as Types.JobResponse)
    : ((await res.json) as Types.ErrorResponse);
}
export async function deleteJob(
  auth: Types.Auth,
  jobId: number
): Promise<Types.DeleteResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}`, auth, { method: 'DELETE' });
  return res.ok
    ? { responseType: 'delete', status: res.status }
    : ((await res.json) as Types.ErrorResponse);
}

export async function createBuild(
  auth: Types.Auth,
  jobId: number,
  build: Types.BuildConfig
): Promise<Types.BuildResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build`, auth, { method: 'POST', body: build });
  return res.ok
    ? ((await res.json) as Types.BuildResponse)
    : ((await res.json) as Types.ErrorResponse);
}
export async function getBuild(
  auth: Types.Auth,
  jobId: number,
  buildId: number
): Promise<Types.BuildResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build/${buildId}`, auth);
  return res.ok
    ? ((await res.json) as Types.BuildResponse)
    : ((await res.json) as Types.ErrorResponse);
}
export async function getBuilds(
  auth: Types.Auth,
  jobId: number
): Promise<Types.BuildResponse[] | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build`, auth);
  return res.ok
    ? ((await res.json) as Types.BuildResponse[])
    : ((await res.json) as Types.ErrorResponse);
}
export async function deleteBuild(
  auth: Types.Auth,
  jobId: number,
  buildId: number
): Promise<Types.DeleteResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build/${buildId}`, auth, { method: 'DELETE' });
  return res.ok
    ? { responseType: 'delete', status: res.status }
    : ((await res.json) as Types.ErrorResponse);
}

export async function createRelease(
  auth: Types.Auth,
  jobId: number,
  buildId: number,
  release: Types.ReleaseConfig
): Promise<Types.ReleaseResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build/${buildId}`, auth, {
    method: 'PUT',
    body: release
  });
  return res.ok
    ? ((await res.json) as Types.ReleaseResponse)
    : ((await res.json) as Types.ErrorResponse);
}
export async function getRelease(
  auth: Types.Auth,
  jobId: number,
  buildId: number,
  releaseId: number
): Promise<Types.ReleaseResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build/${buildId}/release/${releaseId}`, auth);
  return res.ok
    ? ((await res.json) as Types.ReleaseResponse)
    : ((await res.json) as Types.ErrorResponse);
}
export async function deleteRelease(
  auth: Types.Auth,
  jobId: number,
  buildId: number,
  releaseId: number
): Promise<Types.DeleteResponse | Types.ErrorResponse> {
  const res = await request(`job/${jobId}/build/${buildId}/release/${releaseId}`, auth, {
    method: 'DELETE'
  });
  return res.ok
    ? { responseType: 'delete', status: res.status }
    : ((await res.json) as Types.ErrorResponse);
}
