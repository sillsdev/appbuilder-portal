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
    status: 'initialized' | 'accepted' | 'complete' | 'delete' | 'deleting';
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
    status: 'initialized' | 'accepted' | 'active' | 'expired' | 'postprocessing' | 'completed';
    result: 'SUCCESS' | 'FAILURE' | 'ABORTED' | null;
    error: string | null;
    artifacts: { [key: string]: string };
  };

export type Channels = 'production' | 'beta' | 'alpha'

type ReleaseCommon = {
  channel: Channels;
  targets: string;
};
export type ReleaseConfig = ReleaseCommon & {
  environment: { [key: string]: string };
};
export type ReleaseResponse = SuccessResponse &
  ReleaseCommon & {
    responseType: 'release';
    buildId: number;
    status: 'initialized' | 'accepted' | 'active' | 'expired' | 'completed' | 'postprocessing';
    result: 'SUCCESS' | 'FAILURE' | 'EXCEPTION' | null;
    error: string | null;
    console_text: string;
    artifacts: { [key: string]: string };
  };
