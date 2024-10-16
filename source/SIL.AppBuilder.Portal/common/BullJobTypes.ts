import { Channels } from './build-engine-api/types.js';

export enum ScriptoriaJobType {
  Test = 'Test',
  ReassignUserTasks = 'ReassignUserTasks',
  CreateProduct = 'CreateProduct',
  BuildProduct = 'BuildProduct',
  EmailReviewers = 'EmailReviewers',
  PublishProduct = 'PublishProduct'
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

export type ScriptoriaJob = JobTypeMap[keyof JobTypeMap];

export type JobTypeMap = {
  [ScriptoriaJobType.Test]: TestJob;
  [ScriptoriaJobType.ReassignUserTasks]: SyncUserTasksJob;
  [ScriptoriaJobType.CreateProduct]: CreateProductJob;
  [ScriptoriaJobType.BuildProduct]: BuildProductJob;
  [ScriptoriaJobType.EmailReviewers]: EmailReviewersJob;
  [ScriptoriaJobType.PublishProduct]: PublishProductJob;
  // Add more mappings here as needed
};
