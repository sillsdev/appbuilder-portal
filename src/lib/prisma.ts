export enum RoleId {
  SuperAdmin = 1,
  OrgAdmin,
  AppBuilder,
  Author
}

export enum StoreType {
  GooglePlay = 1,
  S3,
  Cloud
}

export enum ProductTransitionType {
  Activity = 1,
  StartWorkflow,
  EndWorkflow,
  CancelWorkflow,
  ProjectAccess,
  Migration
}

export enum WorkflowType {
  Startup = 1,
  Rebuild,
  Republish
}

export const WorkflowTypeString = ['', 'Startup', 'Rebuild', 'Republish'];
