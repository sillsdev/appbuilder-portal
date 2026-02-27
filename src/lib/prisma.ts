import type { Prisma } from '@prisma/client';

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

// returns store.GooglePlayTitle iff store is a GooglePlay store
export function displayStoreGPTitle(
  store: Prisma.StoresGetPayload<{ select: { GooglePlayTitle: true; StoreTypeId: true } }>
) {
  return store.StoreTypeId === StoreType.GooglePlay ? (store.GooglePlayTitle ?? '') : '';
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

export enum TaskType {
  Workflow = 1,
  DeletionRequest
}
