export enum RoleId {
  SuperAdmin = 1,
  OrgAdmin,
  AppBuilder,
  Author
}

export enum ProductTransitionType {
  Activity = 1,
  StartWorkflow,
  EndWorkflow,
  CancelWorkflow,
  ProjectAccess
}

export enum WorkflowType {
  Startup = 1,
  Rebuild,
  Republish
}

export const WorkflowTypeString = ['', 'Startup', 'Rebuild', 'Republish'];
