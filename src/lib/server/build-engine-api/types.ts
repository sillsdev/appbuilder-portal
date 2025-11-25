// HTTP 502 Bad Gateway (should be the right semantics???)
export const EndpointUnavailable = 502;

export type Auth =
  | {
      type: 'query';
      organizationId: number;
    }
  | {
      type: 'provided';
      url: string;
      token: string;
    };

export type RequestOpts = {
  method?: string;
  body?: Record<string, unknown>;
  checkStatusFirst?: boolean;
};

export type Response =
  | ErrorResponse
  | ProjectResponse
  | TokenResponse
  | BuildResponse
  | ReleaseResponse
  | StatusResponse;

export type ErrorResponse = {
  responseType: 'error';
  name: string;
  message: string;
  code: number;
  status: number;
  type: string;
};

export function toErrorResponse(
  json: Record<string, unknown> | Record<string, unknown>[]
): ErrorResponse {
  const _json = Array.isArray(json) ? json[0] : json;
  return {
    name: '',
    message: '<empty error message>',
    code: 500,
    status: 500,
    type: '',
    ..._json,
    responseType: 'error'
  } as ErrorResponse;
}

export type DeleteResponse = {
  responseType: 'delete';
  status: number;
};

export function toDeleteResponse(status: number): DeleteResponse {
  return { responseType: 'delete', status } as DeleteResponse;
}

type SuccessResponse = {
  responseType: 'project' | 'token' | 'job' | 'build' | 'release' | 'status';
  id: number;
  created: string;
  updated: string;
  _links: {
    self?: {
      href: string;
    };
    job?: {
      href: string;
    };
  };
} & Record<string, unknown>;

export type StatusResponse = SuccessResponse & {
  responseType: 'status';
  id: never;
  updated: never;
  status: number;
  versions: Record<string, string>;
  imageHash: string;
};

export function toStatusResponse(
  status: number,
  body: Record<string, unknown> = {}
): StatusResponse {
  return { responseType: 'status', status, ...body } as StatusResponse;
}

type CommonStatus = 'initialized' | 'accepted' | 'completed';
type CommonResult = 'SUCCESS' | 'FAILURE' | null;

export type ProjectConfig = {
  app_id: string;
  project_name: string;
  language_code: string;
  storage_type: string;
};
export type ProjectResponse = SuccessResponse &
  ProjectConfig & {
    responseType: 'project';
    status: CommonStatus | 'delete' | 'deleting';
    result: CommonResult;
    error: string | null;
    url: string;
    publishing_key: string;
    user_id: string;
    group_id: string;
  };
export function toProjectResponse(json: Record<string, unknown>): ProjectResponse {
  return { ...json, responseType: 'project' } as ProjectResponse;
}

export type TokenConfig = {
  name: string;
  ReadOnly: boolean;
};
export type TokenResponse = {
  responseType: 'token';
  SessionToken: string;
  SecretAccessKey: string;
  AccessKeyId: string;
  Expiration: string;
  Region: string;
  ReadOnly: boolean;
};

export function toTokenResponse(json: Record<string, unknown>): TokenResponse {
  return { ...json, responseType: 'token' } as TokenResponse;
}

export type JobConfig = {
  request_id: string;
  git_url: string;
  app_id: string;
  publisher_id: string;
};
export type JobResponse = SuccessResponse &
  JobConfig & {
    responseType: 'job';
  };

export function toJobResponse(json: Record<string, unknown>): JobResponse {
  return { ...json, responseType: 'job' } as JobResponse;
}

type BuildOrReleaseStatus = 'active' | 'expired' | 'postprocessing';

type BuildCommon = {
  targets: string;
};
export type BuildConfig = BuildCommon & {
  environment: Record<string, string>;
};
export type BuildResponse = SuccessResponse &
  BuildCommon & {
    responseType: 'build';
    job_id: number;
    status: CommonStatus | BuildOrReleaseStatus;
    result: CommonResult | 'ABORTED';
    error: string | null;
    artifacts: Record<string, string>;
  };

export function toBuildResponse(json: Record<string, unknown>): BuildResponse {
  return { ...json, responseType: 'build' } as BuildResponse;
}

export type Channels = 'production' | 'beta' | 'alpha';

type ReleaseCommon = {
  channel: Channels;
  targets: string;
};
export type ReleaseConfig = ReleaseCommon & {
  environment: Record<string, string>;
};
export type ReleaseResponse = SuccessResponse &
  ReleaseCommon & {
    responseType: 'release';
    buildId: number;
    status: CommonStatus | BuildOrReleaseStatus;
    result: CommonResult | 'EXCEPTION';
    error: string | null;
    consoleText: string;
    artifacts: Record<string, string>;
  };

export function toReleaseResponse(json: Record<string, unknown>): ReleaseResponse {
  return { ...json, responseType: 'release' } as ReleaseResponse;
}
