export type Auth = {
  type: 'query';
  organizationId: number;
} | {
  type: 'provided';
  url: string;
  token: string;
}

export type Response =
  | ErrorResponse
  | ProjectResponse
  | TokenResponse
  | BuildResponse
  | ReleaseResponse;

export type ErrorResponse = {
  responseType: 'error';
  name: string;
  message: string;
  code: number;
  status: number;
  type: string;
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

export type ProjectConfig = {
  user_id: string;
  group_id: string;
  app_id: string;
  project_name: string;
  language_code: string;
  publishing_key: string;
  storage_type: string;
};
export type ProjectResponse = SuccessResponse &
  ProjectConfig & {
    responseType: 'project';
    status: CommonStatus | 'delete' | 'deleting';
    result: 'SUCCESS' | 'FAILURE' | null;
    error: string | null;
    url: string;
  };

export type TokenConfig = {
  name: string;
};
export type TokenResponse = {
  responseType: 'token';
  session_token: string;
  secret_access_key: string;
  access_key_id: string;
  expiration: string;
  region: string;
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
  environment: { [key: string]: string };
};
export type BuildResponse = SuccessResponse &
  BuildCommon & {
    responseType: 'build';
    job_id: number;
    status: CommonStatus | BuildOrReleaseStatus;
    result: 'SUCCESS' | 'FAILURE' | 'ABORTED' | null;
    error: string | null;
    artifacts: { [key: string]: string };
  };

type ReleaseCommon = {
  channel: 'production' | 'beta' | 'alpha';
  targets: string;
};
export type ReleaseConfig = ReleaseCommon & {
  environment: { [key: string]: string };
};
export type ReleaseResponse = SuccessResponse &
  ReleaseCommon & {
    responseType: 'release';
    buildId: number;
    status: CommonStatus | BuildOrReleaseStatus;
    result: 'SUCCESS' | 'FAILURE' | 'EXCEPTION' | null;
    error: string | null;
    console_text: string;
    artifacts: { [key: string]: string };
  };
