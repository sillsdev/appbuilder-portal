import type { Prisma } from '@prisma/client';
import type { ValidI13nKey } from './locales.svelte';

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

export enum ProjectActionType {
  Archival = 1, // Archive or Reactivate
  Access, // Upload or Download
  Product, // Add or Remove
  OwnerGroup, // Reassign owner or group
  Author, // Add or Remove
  Reviewer, // Add or Remove
  EditField // Edit other fields
}

export const ProjectActionString = {
  Archive: 'common_archive',
  Reactivate: 'common_reactivate',
  AddProduct: 'products_add',
  RemoveProduct: 'products_remove',
  Claim: 'project_claimOwnership',
  AssignOwner: 'project_dropdown_transfer',
  AssignGroup: 'project_action_group',
  // with authors_title
  AddAuthor: 'models_add',
  RemoveAuthor: 'models_delete',
  // with reviewers_title
  AddReviewer: 'models_add',
  RemoveReviewer: 'models_delete',
  // with models_edit
  EditName: 'project_name',
  EditLanguage: 'project_languageCode',
  EditDescription: 'common_description',
  EditSettings: 'project_settings_title'
} as const satisfies Record<string, ValidI13nKey>;

export const ProjectActionValue = {
  RebuildsOn: 'project_acts_autoBuilds_on',
  RebuildsOff: 'project_acts_autoBuilds_off',
  DownloadsOn: 'project_acts_downloads_on',
  DownloadsOff: 'project_acts_downloads_off',
  AutoPublishOn: 'project_acts_autoPublish_on',
  AutoPublishOff: 'project_acts_autoPublish_off',
  VisibilityOn: 'project_acts_isPublic_on',
  VisibilityOff: 'project_acts_isPublic_off'
} as const satisfies Record<string, ValidI13nKey>;

export enum ProductTransitionType {
  Activity = 1,
  StartWorkflow,
  EndWorkflow,
  CancelWorkflow,
  /* deprecated */ ProjectAccess,
  Migration,
  /* deprecated */ Archival,
  /* deprecated */ Reactivation,
  Transfer,
  Update
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

/**
 * this is not an exhaustive list of states from BuildEngine,
 * just the ones we currently care about in Scriptoria
 */
export enum BuildStatus {
  Pending = 'pending',
  PostProcessing = 'postprocessing',
  Completed = 'completed'
}
