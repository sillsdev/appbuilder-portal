import { Channels } from './build-engine-api/types.js';
import { RoleId } from './public/prisma.js';

export enum ScriptoriaJobType {
  Test = 'Test',
  ModifyUserTasks = 'ModifyUserTasks',
  CreateProduct = 'CreateProduct',
  BuildProduct = 'BuildProduct',
  EmailReviewers = 'EmailReviewers',
  PublishProduct = 'PublishProduct',
  CheckBuildProduct = 'CheckBuildProduct',
  CheckPublishProduct = 'CheckPublishProduct',
  CheckSystemStatuses = 'CheckSystemStatuses',
  CreateProject = 'CreateProject',
  CheckCreateProject = 'CheckCreateProject'
}

export interface TestJob {
  type: ScriptoriaJobType.Test;
  time: number;
}

export enum UserTaskOp {
  Delete = 'Delete',
  Update = 'Update',
  Create = 'Create',
  Reassign = 'Reassign'
}

type UserTaskOpConfig = (
  | ({
      type: UserTaskOp.Delete | UserTaskOp.Create | UserTaskOp.Update;
    } & (
      | { by: 'All' }
      | { by: 'Role'; roles: RoleId[] }
      | {
          by: 'UserId';
          users: number[];
        }
    ))
  | {
      type: UserTaskOp.Reassign;
      by?: 'UserIdMapping' // <- This is literally just so TS doesn't complain
      userMapping: { from: number; to: number }[];
    }
);

// Using type here instead of interface for easier composition
export type ModifyUserTasksJob = (
  | {
      scope: 'Project';
      projectId: number;
    }
  | {
      scope: 'Product';
      productId: string;
    }
) & {
  type: ScriptoriaJobType.ModifyUserTasks;
  comment?: string; // just ignore comment for Delete and Reassign
  operation: UserTaskOpConfig;
};

export interface CreateProductJob {
  type: ScriptoriaJobType.CreateProduct;
  productId: string;
}

export interface BuildProductJob {
  type: ScriptoriaJobType.BuildProduct;
  productId: string;
  targets?: string;
  environment: { [key: string]: string };
}

export interface EmailReviewersJob {
  type: ScriptoriaJobType.EmailReviewers;
  productId: string;
}

export interface PublishProductJob {
  type: ScriptoriaJobType.PublishProduct;
  productId: string;
  channel: Channels;
  targets: string;
  environment: { [key: string]: any };
}

export interface CheckBuildProductJob {
  type: ScriptoriaJobType.CheckBuildProduct;
  organizationId: number;
  productId: string;
  jobId: number;
  buildId: number;
}

export interface CheckPublishProductJob {
  type: ScriptoriaJobType.CheckPublishProduct;
  organizationId: number;
  productId: string;
  jobId: number;
  buildId: number;
  releaseId: number;
}

export interface CheckSystemStatusesJob {
  type: ScriptoriaJobType.CheckSystemStatuses;
}

export interface CreateProjectJob {
  type: ScriptoriaJobType.CreateProject;
  projectId: number;
}

export interface CheckCreateProjectJob {
  type: ScriptoriaJobType.CheckCreateProject;
  workflowProjectId: number;
  organizationId: number;
  projectId: number;
}

export type ScriptoriaJob = JobTypeMap[keyof JobTypeMap];

export type JobTypeMap = {
  [ScriptoriaJobType.Test]: TestJob;
  [ScriptoriaJobType.ModifyUserTasks]: ModifyUserTasksJob;
  [ScriptoriaJobType.CreateProduct]: CreateProductJob;
  [ScriptoriaJobType.BuildProduct]: BuildProductJob;
  [ScriptoriaJobType.EmailReviewers]: EmailReviewersJob;
  [ScriptoriaJobType.PublishProduct]: PublishProductJob;
  [ScriptoriaJobType.CheckBuildProduct]: CheckBuildProductJob;
  [ScriptoriaJobType.CheckPublishProduct]: CheckPublishProductJob;
  [ScriptoriaJobType.CheckSystemStatuses]: CheckSystemStatusesJob;
  [ScriptoriaJobType.CreateProject]: CreateProjectJob;
  [ScriptoriaJobType.CheckCreateProject]: CheckCreateProjectJob;
  // Add more mappings here as needed
};
