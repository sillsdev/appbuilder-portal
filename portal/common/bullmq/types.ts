/* eslint-disable @typescript-eslint/no-namespace */
import type { BuildResponse, Channels, ReleaseResponse } from '../build-engine-api/types.js';
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
  UserTasks = 'User Tasks',
  Email = 'Email'
}

export enum JobType {
  // Build Tasks
  Build_Product = 'Build Product',
  Build_Check = 'Check Product Build',
  Build_PostProcess = 'Postprocess Build',
  // Product Tasks
  Product_Create = 'Create Product',
  Product_Delete = 'Delete Product',
  Product_GetVersionCode = 'Get VersionCode for Uploaded Product',
  // Project Tasks
  Project_Create = 'Create Project',
  Project_Check = 'Check Project Creation',
  Project_ImportProducts = 'Import Products for Project',
  // Publishing Tasks
  Publish_Product = 'Publish Product',
  Publish_Check = 'Check Product Publish',
  Publish_PostProcess = 'Postprocess Publish',
  // Recurring Tasks
  Recurring_CheckSystemStatuses = 'Check System Statuses',
  Recurring_RefreshLangTags = 'Refresh langtags.json',
  // UserTasks
  UserTasks_Modify = 'Modify UserTasks',
  // Email
  Email_InviteUser = 'Invite User',
  Email_SendNotificationToUser = 'Send Notification to User',
  Email_SendNotificationToReviewers = 'Send Notification to Product Reviewers',
  Email_SendNotificationToOrgAdminsAndOwner = 'Send Notification to Org Admins and Owners',
  Email_SendBatchUserTaskNotifications = 'Send Batch User Task Notifications',
  Email_NotifySuperAdminsOfNewOrganizationRequest = 'Notify Super Admins of New Organization Request',
  Email_NotifySuperAdminsOfOfflineSystems = 'Notify Super Admins of Offline Systems',
  Email_ProjectImportReport = 'Project Import Report'
}

export namespace Build {
  export interface Product {
    type: JobType.Build_Product;
    productId: string;
    defaultTargets: string;
    environment: Record<string, string>;
  }
  export interface Check {
    type: JobType.Build_Check;
    organizationId: number;
    productId: string;
    jobId: number;
    buildId: number;
    productBuildId: number;
  }
  export interface PostProcess {
    type: JobType.Build_PostProcess;
    productId: string;
    productBuildId: number;
    build: BuildResponse;
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
  export interface GetVersionCode {
    type: JobType.Product_GetVersionCode;
    productId: string;
  }
}

export namespace Project {
  export interface Create {
    type: JobType.Project_Create;
    projectId: number;
  }

  export interface Check {
    type: JobType.Project_Check;
    workflowProjectId: number;
    organizationId: number;
    projectId: number;
  }

  export interface ImportProducts {
    type: JobType.Project_ImportProducts;
    organizationId: number;
    importId: number;
    projectId: number;
  }
}

export namespace Publish {
  export interface Product {
    type: JobType.Publish_Product;
    productId: string;
    defaultChannel: Channels;
    defaultTargets: string;
    environment: Record<string, string>;
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

  export interface PostProcess {
    type: JobType.Publish_PostProcess;
    productId: string;
    publicationId: number;
    release: ReleaseResponse;
  }
}

export namespace Recurring {
  export interface CheckSystemStatuses {
    type: JobType.Recurring_CheckSystemStatuses;
  }
  export interface RefreshLangTags {
    type: JobType.Recurring_RefreshLangTags;
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

export namespace Email {
  export interface InviteUser {
    type: JobType.Email_InviteUser;
    email: string;
    inviteToken: string;
    inviteLink: string;
  }
  export interface SendNotificationToUser {
    type: JobType.Email_SendNotificationToUser;
    userId: number;
    messageKey: string;
    messageProperties: Record<string, string>;
    link?: string;
  }
  export interface SendNotificationToReviewers {
    type: JobType.Email_SendNotificationToReviewers;
    productId: string;
  }
  export interface SendNotificationToOrgAdminsAndOwner {
    type: JobType.Email_SendNotificationToOrgAdminsAndOwner;
    projectId: number;
    messageKey: string;
    messageProperties: {
      [key: string]: string;
    };
    link?: string;
  }
  export interface SendBatchUserTaskNotifications {
    type: JobType.Email_SendBatchUserTaskNotifications;
    notifications: {
      userId: number;
      activityName: string;
      project: string;
      productName: string;
      status: string;
      originator: string;
      comment: string;
    }[];
  }
  export interface NotifySuperAdminsOfNewOrganizationRequest {
    type: JobType.Email_NotifySuperAdminsOfNewOrganizationRequest;
    organizationName: string;
    email: string;
    url: string;
  }

  export interface NotifySuperAdminsOfOfflineSystems {
    type: JobType.Email_NotifySuperAdminsOfOfflineSystems;
  }

  export interface ProjectImportReport {
    type: JobType.Email_ProjectImportReport;
    importId: number;
  }
}

export type Job = JobTypeMap[keyof JobTypeMap];

export type JobTypeMap = {
  [JobType.Build_Product]: Build.Product;
  [JobType.Build_Check]: Build.Check;
  [JobType.Build_PostProcess]: Build.PostProcess;
  [JobType.Product_Create]: Product.Create;
  [JobType.Product_Delete]: Product.Delete;
  [JobType.Product_GetVersionCode]: Product.GetVersionCode;
  [JobType.Project_Create]: Project.Create;
  [JobType.Project_Check]: Project.Check;
  [JobType.Project_ImportProducts]: Project.ImportProducts;
  [JobType.Publish_Product]: Publish.Product;
  [JobType.Publish_Check]: Publish.Check;
  [JobType.Publish_PostProcess]: Publish.PostProcess;
  [JobType.Recurring_CheckSystemStatuses]: Recurring.CheckSystemStatuses;
  [JobType.Recurring_RefreshLangTags]: Recurring.RefreshLangTags;
  [JobType.UserTasks_Modify]: UserTasks.Modify;
  [JobType.Email_InviteUser]: Email.InviteUser;
  [JobType.Email_SendNotificationToUser]: Email.SendNotificationToUser;
  [JobType.Email_SendNotificationToReviewers]: Email.SendNotificationToReviewers;
  [JobType.Email_SendNotificationToOrgAdminsAndOwner]: Email.SendNotificationToOrgAdminsAndOwner;
  [JobType.Email_SendBatchUserTaskNotifications]: Email.SendBatchUserTaskNotifications;
  [JobType.Email_NotifySuperAdminsOfNewOrganizationRequest]: Email.NotifySuperAdminsOfNewOrganizationRequest;
  [JobType.Email_NotifySuperAdminsOfOfflineSystems]: Email.NotifySuperAdminsOfOfflineSystems;
  [JobType.Email_ProjectImportReport]: Email.ProjectImportReport;
  // Add more mappings here as needed
};

export enum JobSchedulerId {
  SystemStatusEmail = 'SystemStatusEmail',
  RefreshLangTags = 'RefreshLangTags',
  CheckSystemStatuses = 'CheckSystemStatuses'
}
