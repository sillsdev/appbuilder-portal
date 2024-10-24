import { Channels } from './build-engine-api/types.js';
import { RoleId } from './public/prisma.js';

interface RetryOptions {
  readonly attempts: number;
  readonly backoff: {
    readonly type: string;
    readonly delay: number;
  }
}

export const Retry5e5: RetryOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 5000 // 5 seconds
  }
};

export enum ScriptoriaJobType {
  // Build Tasks
  Build_Product = 'Build Product',
  Build_Check = 'Check Product Build',
  // Notification Tasks
  Notify_Reviewers = 'Notify Reviewers',
  // Product Tasks
  Product_Create = 'Create Product',
  Product_Delete = 'Delete Product',
  // Project Tasks
  Project_Create = 'Create Project',
  Project_Check = 'Check Project Creation',
  // Publishing Tasks
  Publish_Product = 'Publish Product',
  Publish_Check = 'Check Product Publish',
  // System Tasks
  System_CheckStatuses = 'Check System Statuses',
  // Test
  Test = 'Test',
  // Other Tasks (for now)
  UserTasks_Modify = 'Modify UserTasks'
}

export namespace Build {
  export interface Product {
    type: ScriptoriaJobType.Build_Product;
    productId: string;
    targets?: string;
    environment: { [key: string]: string };
  }

  export interface Check {
    type: ScriptoriaJobType.Build_Check;
    organizationId: number;
    productId: string;
    jobId: number;
    buildId: number;
    productBuildId: number;
  }
}

export namespace Notify {
  export interface Reviewers {
    type: ScriptoriaJobType.Notify_Reviewers;
    productId: string;
  }
}

export namespace Product {
  export interface Create {
    type: ScriptoriaJobType.Product_Create;
    productId: string;
  }
  export interface Delete {
    type: ScriptoriaJobType.Product_Delete;
    organizationId: number;
    workflowJobId: number;
  }
}

export namespace Project {
  export interface Create {
    type: ScriptoriaJobType.Project_Create;
    projectId: number;
  }
  
  export interface Check {
    type: ScriptoriaJobType.Project_Check;
    workflowProjectId: number;
    organizationId: number;
    projectId: number;
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
    type: ScriptoriaJobType.UserTasks_Modify;
    comment?: string; // just ignore comment for Delete and Reassign
    operation: Config;
  };
}

export namespace Publish {
  export interface Product {
    type: ScriptoriaJobType.Publish_Product;
    productId: string;
    channel: Channels;
    targets: string;
    environment: { [key: string]: any };
  }
  
  export interface Check {
    type: ScriptoriaJobType.Publish_Check;
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
    type: ScriptoriaJobType.System_CheckStatuses;
  }
}

export interface Test {
  type: ScriptoriaJobType.Test;
  time: number;
}

export type ScriptoriaJob = JobTypeMap[keyof JobTypeMap];

export type JobTypeMap = {
  [ScriptoriaJobType.Build_Product]: Build.Product;
  [ScriptoriaJobType.Build_Check]: Build.Check;
  [ScriptoriaJobType.Notify_Reviewers]: Notify.Reviewers;
  [ScriptoriaJobType.Product_Create]: Product.Create;
  [ScriptoriaJobType.Product_Delete]: Product.Delete;
  [ScriptoriaJobType.Project_Create]: Project.Create;
  [ScriptoriaJobType.Project_Check]: Project.Check;
  [ScriptoriaJobType.Publish_Product]: Publish.Product;
  [ScriptoriaJobType.Publish_Check]: Publish.Check;
  [ScriptoriaJobType.UserTasks_Modify]: UserTasks.Modify;
  [ScriptoriaJobType.System_CheckStatuses]: System.CheckStatuses;
  [ScriptoriaJobType.Test]: Test;
  // Add more mappings here as needed
};
