export enum QueueName {
  Builds = 'Builds',
  System_Recurring = 'System (Recurring)',
  System_Startup = 'System (Startup)',
  Products = 'Products',
  Projects = 'Projects',
  Publishing = 'Publishing',
  Polling = 'Polling',
  UserTasks = 'User Tasks',
  Emails = 'Emails',
  SvelteSSE = 'Svelte SSE'
}

export enum JobType {
  // Build Jobs
  Build_Product = 'Build Product',
  Build_PostProcess = 'Postprocess Build',
  Build_Delete = 'Delete Build - BuildEngine',
  // Polling Jobs
  Poll_Build = 'Check Product Build',
  Poll_Project = 'Check Project Creation',
  Poll_Publish = 'Check Product Publish',
  // Product Jobs
  Product_Create = 'Create Product - BuildEngine',
  Product_Delete = 'Delete Product - BuildEngine',
  Product_GetVersionCode = 'Get VersionCode for Uploaded Product',
  Product_CreateLocal = 'Create Local Product',
  Product_UpdateStore = 'Update Product PublisherId',
  // Project Jobs
  Project_Create = 'Create Project',
  Project_ImportProducts = 'Import Products for Project',
  // Publishing Jobs
  Publish_Product = 'Publish Product',
  Publish_PostProcess = 'Postprocess Publish',
  Publish_Delete = 'Delete Release - BuildEngine',
  // System Jobs
  System_CheckEngineStatuses = 'Check BuildEngine Statuses',
  System_RefreshLangTags = 'Refresh langtags.json',
  System_Migrate = 'Migrate Features from S1 to S2',
  // UserTasks Job
  UserTasks_Workflow = 'Modify Workflow UserTasks',
  UserTasks_DeleteRequest = 'Modify Data Deletion UserTasks',
  // Email Jobs
  Email_InviteUser = 'Invite User',
  Email_SendNotificationToUser = 'Send Notification to User',
  Email_SendNotificationToReviewers = 'Send Notification to Product Reviewers',
  Email_SendNotificationToOrgAdminsAndOwner = 'Send Notification to Org Admins and Owners',
  Email_SendBatchUserTaskNotifications = 'Send Batch User Task Notifications',
  Email_NotifySuperAdminsOfNewOrganizationRequest = 'Notify Super Admins of New Organization Request',
  Email_NotifySuperAdminsOfOfflineSystems = 'Notify Super Admins of Offline Systems',
  Email_NotifySuperAdminsLowPriority = 'Notify Super Admins (Low Priority)',
  Email_ProjectImportReport = 'Project Import Report',
  // Svelte Project SSE
  SvelteSSE_UpdateProject = 'Update Project',
  SvelteSSE_UpdateUserTasks = 'Update UserTasks'
}

export enum JobSchedulerId {
  SystemStatusEmail = 'SystemStatusEmail',
  RefreshLangTags = 'RefreshLangTags',
  CheckSystemStatuses = 'CheckSystemStatuses',
  PruneUsers = 'PruneUsers'
}
