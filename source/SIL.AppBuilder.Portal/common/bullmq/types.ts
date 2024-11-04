/* eslint-disable @typescript-eslint/no-namespace */ 
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

export enum QueueName {
  DefaultRecurring = 'Default Recurring',
  UserTasks = 'User Tasks'
}

export enum JobType {
  // System Tasks
  System_CheckStatuses = 'Check System Statuses',
  // UserTasks
  UserTasks_Modify = 'Modify UserTasks'
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
    | ({
        type: OpType.Delete | OpType.Create | OpType.Update;
      } & (
        | { by: 'All' }
        | { by: 'Role'; roles: RoleId[] }
        | {
            by: 'UserId';
            users: number[];
          }
      ))
    | {
        type: OpType.Reassign;
        by?: 'UserIdMapping'; // <- This is literally just so TS doesn't complain
        userMapping: { from: number; to: number }[];
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
  [JobType.System_CheckStatuses]: System.CheckStatuses;
  [JobType.UserTasks_Modify]: UserTasks.Modify;
  // Add more mappings here as needed
};
