import type { RoleId } from './prisma.js';

export enum ActionType {
  /** Automated Action */
  Auto = 0,
  /** User-initiated Action */
  User
}

/**
 * The administrative requirements of the workflow.
 * Examples:
 *  - If the flow has `WorkflowAdminRequirements.ApprovalProcess` it will include extra state to represent the organizational approval process
 *  - If the flow has `WorkflowAdminRequirements.StoreAccess` it will not include those states, but there are still some states that require action from an OrgAdmin to complete certain actions
 *  - If the flow has `WorkflowAdminRequirements.None` none of the states or actions for the workflow instance will require an OrgAdmin.
 *
 * Any state or transition can have a list of specified `WorkflowAdminRequirements`s. What this means is that those states and transitions will be included in a workflow instance ONLY when the instance's `WorkflowAdminRequirements` is in the state's or transition's list.
 *
 * If a state or transition does not specify any `WorkflowAdminRequirements` it will be included (provided it passes other conditions not dependent on `WorkflowAdminRequirements`).
 */
export enum WorkflowAdminRequirements {
  None = 0,
  StoreAccess,
  ApprovalProcess
}

export enum ProductType {
  Android_GooglePlay = 0,
  Android_S3,
  AssetPackage,
  Web
}

export type StateName =
  | 'Readiness Check'
  | 'Approval'
  | 'Approval Pending'
  | 'Terminated'
  | 'App Builder Configuration'
  | 'Author Configuration'
  | 'Synchronize Data'
  | 'Author Download'
  | 'Author Upload'
  | 'Product Build'
  | 'App Store Preview'
  | 'Create App Store Entry'
  | 'Verify and Publish'
  | 'Product Publish'
  | 'Make It Live'
  | 'Published'
  | 'Product Creation';

export type WorkflowContext = {
  instructions:
    | 'asset_package_verify_and_publish'
    | 'app_configuration'
    | 'create_app_entry'
    | 'authors_download'
    | 'googleplay_configuration'
    | 'googleplay_verify_and_publish'
    | 'make_it_live'
    | 'approval_pending'
    | 'readiness_check'
    | 'synchronize_data'
    | 'authors_upload'
    | 'verify_and_publish'
    | 'waiting'
    | 'web_verify'
    | null;
  includeFields: (
    | 'ownerName'
    | 'ownerEmail'
    | 'storeDescription'
    | 'listingLanguageCode'
    | 'projectURL'
    | 'productDescription'
    | 'appType'
    | 'projectLanguageCode'
  )[];
  includeReviewers: boolean;
  includeArtifacts: 'apk' | 'aab' | boolean;
  start?: StateName;
  adminRequirements: WorkflowAdminRequirements[];
  // Not sure how this is used, but will figure out when integrating into backend
  environment: { [key: string]: any };
  productType: ProductType;
  productId: string;
  hasAuthors: boolean;
  hasReviewers: boolean;
};

export type WorkflowConfig = {
  adminRequirements: WorkflowAdminRequirements[];
  productType: ProductType;
};

export type WorkflowInput = WorkflowConfig & {
  productId: string;
  hasAuthors: boolean;
  hasReviewers: boolean;
};

// TODO: Just put this info directly in the database
export function workflowInputFromDBProductType(workflowDefinitionId: number): WorkflowConfig {
  switch (workflowDefinitionId) {
    case 1: // sil_android_google_play
      return {
        adminRequirements: [
          WorkflowAdminRequirements.ApprovalProcess,
          WorkflowAdminRequirements.StoreAccess
        ],
        productType: ProductType.Android_GooglePlay
      };
    case 4: // sil_android_s3
      return {
        adminRequirements: [WorkflowAdminRequirements.ApprovalProcess],
        productType: ProductType.Android_S3
      };
    case 6: // la_android_google_play
      return {
        adminRequirements: [WorkflowAdminRequirements.StoreAccess],
        productType: ProductType.Android_GooglePlay
      };
    case 7: // na_android_google_play
      return {
        adminRequirements: [WorkflowAdminRequirements.None],
        productType: ProductType.Android_GooglePlay
      };
    case 8: // na_android_s3
      return {
        adminRequirements: [WorkflowAdminRequirements.None],
        productType: ProductType.Android_S3
      };
    case 9: // pwa_cloud
    case 11: // html_cloud
      return {
        adminRequirements: [WorkflowAdminRequirements.None],
        productType: ProductType.Web
      };
    case 13: // asset_package
      return {
        adminRequirements: [WorkflowAdminRequirements.None],
        productType: ProductType.AssetPackage
      };
    default: // would be some other workflow type presumably
      console.log(
        `Unrecognized workflow definition: ${workflowDefinitionId}! Returning configuration for sil_android_google_play.`
      );
      return {
        adminRequirements: [
          WorkflowAdminRequirements.ApprovalProcess,
          WorkflowAdminRequirements.StoreAccess
        ],
        productType: ProductType.Android_GooglePlay
      };
  }
}

/** Used for filtering based on AdminLevel and/or ProductType */
export type MetaFilter = {
  adminRequirements?: WorkflowAdminRequirements[];
  productTypes?: ProductType[];
};

export type WorkflowStateMeta = MetaFilter;

export type WorkflowTransitionMeta = MetaFilter & {
  type: ActionType;
  user?: RoleId;
};

export type WorkflowEvent = {
  type: any;
  comment?: string;
  target?: StateName;
  userId: number | null;
};

export type StateNode = {
  id: number;
  label: string;
  connections: { id: number; target: string; label: string }[];
  inCount: number;
  start?: boolean;
  final?: boolean;
  action?: boolean;
};

export type Snapshot = {
  value: string;
  context: Omit<WorkflowContext, 'productId' | 'hasAuthors' | 'hasReviewers'>;
};
