/* eslint-disable @typescript-eslint/no-namespace */
import type { Channels } from '../build-engine-api/types.js';
import { RoleId } from '../public/prisma.js';

interface RetryOptions {
  readonly attempts: number;
  readonly backoff: {
    readonly type: string;
    readonly delay: number;
  };
}
/** Maximum 5 attempts with a 5 second exponential backoff */
export const Retry5e5: RetryOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 5000 // 5 seconds
  }
};

interface RepeatOptions {
  readonly repeat: {
    readonly pattern: string;
  };
}
/** Repeat a job every minute */
export const RepeatEveryMinute: RepeatOptions = {
  repeat: {
    pattern: '*/1 * * * *' // every minute
  }
};

export enum QueueName {
  Builds = 'Builds',
  DefaultRecurring = 'Default Recurring',
  Miscellaneous = 'Miscellaneous',
  Publishing = 'Publishing',
  RemotePolling = 'Remote Polling',
  UserTasks = 'User Tasks'
}

export enum JobType {
  // Build Tasks
  Build_Product = 'Build Product',
  Build_Check = 'Check Product Build',
  // Product Tasks
  Product_Create = 'Create Product',
  Product_Delete = 'Delete Product',
  // Publishing Tasks
  Publish_Product = 'Publish Product',
  Publish_Check = 'Check Product Publish',
  // System Tasks
  System_CheckStatuses = 'Check System Statuses',
  // UserTasks
  UserTasks_Modify = 'Modify UserTasks'
}

export namespace Build {
  export interface Product {
    type: JobType.Build_Product;
    productId: string;
    targets?: string;
    environment: { [key: string]: string };
  }
  export interface Check {
    type: JobType.Build_Check;
    organizationId: number;
    productId: string;
    jobId: number;
    buildId: number;
    productBuildId: number;
  }
}

export namespace Product {
  export interface Create {
    type: JobType.Product_Create;
    productId: string;
  }
  export interface Delete {
    type: JobType.Product_Delete;
    organizationId: number;
    workflowJobId: number;
  }
}

export namespace Publish {
  export interface Product {
    type: JobType.Publish_Product;
    productId: string;
    channel: Channels;
    targets: string;
    environment: { [key: string]: string };
  }

  export interface Check {
    type: JobType.Publish_Check;
    organizationId: number;
    productId: string;
    jobId: number;
    buildId: number;
    releaseId: number;
    publicationId: number;
  }
}

export namespace System {
  export interface CheckStatuses {
    type: JobType.System_CheckStatuses;
  }
}

export namespace UserTasks {
  export enum OpType {
    Delete = 'Delete',
    Update = 'Update',
    Create = 'Create',
    Reassign = 'Reassign'
  }
  type Config =
    | {
        type: OpType.Delete | OpType.Create | OpType.Update;
        roles?: RoleId[];
        users?: number[];
      }
    | {
        type: OpType.Reassign;
        userMapping: { from: number; to: number }[];
        roles?: never;
        users?: never;
      };

  // Using type here instead of interface for easier composition
  export type Modify = (
    | {
        scope: 'Project';
        projectId: number;
      }
    | {
        scope: 'Product';
        productId: string;
      }
  ) & {
    type: JobType.UserTasks_Modify;
    comment?: string; // just ignore comment for Delete and Reassign
    operation: Config;
  };
}

export type Job = JobTypeMap[keyof JobTypeMap];

export type JobTypeMap = {
  [JobType.Build_Product]: Build.Product;
  [JobType.Build_Check]: Build.Check;
  [JobType.Product_Create]: Product.Create;
  [JobType.Product_Delete]: Product.Delete;
  [JobType.Publish_Product]: Publish.Product;
  [JobType.Publish_Check]: Publish.Check;
  [JobType.System_CheckStatuses]: System.CheckStatuses;
  [JobType.UserTasks_Modify]: UserTasks.Modify;
  // Add more mappings here as needed
};
