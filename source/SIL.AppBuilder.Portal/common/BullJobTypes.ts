import { Channels } from './build-engine-api/types.js';

export enum ScriptoriaJobType {
  Test = 'Test',
  ReassignUserTasks = 'ReassignUserTasks',
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

export interface SyncUserTasksJob {
  type: ScriptoriaJobType.ReassignUserTasks;
  projectId: number;
}

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
  [ScriptoriaJobType.ReassignUserTasks]: SyncUserTasksJob;
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
