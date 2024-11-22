/* eslint-disable @typescript-eslint/no-namespace */ 
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
  UserTasks = 'User Tasks'
}

export enum JobType {
  // UserTasks
  UserTasks_Reassign = 'Reassign UserTasks'
}

export namespace UserTasks {
  export type Reassign = {
    type: JobType.UserTasks_Reassign;
    projectId: number;
  };
}

export type Job = JobTypeMap[keyof JobTypeMap];

export type JobTypeMap = {
  [JobType.UserTasks_Reassign]: UserTasks.Reassign;
  // Add more mappings here as needed
};
