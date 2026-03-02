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

export enum ApplicationType {
  SAB = 1,
  RAB,
  DAB,
  KAB
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
