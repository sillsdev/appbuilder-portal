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

export type StatusResponse = {
  responseType: 'status';
  status: number;
};

export type DeleteResponse = {
  responseType: 'delete';
  status: number;
};

type SuccessResponse = {
  responseType: 'project' | 'token' | 'job' | 'build' | 'release';
  id: number;
  created: Date;
  updated: Date;
  _links: {
    self?: {
      href: string;
    };
    job?: {
      href: string;
    };
  };
};

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
