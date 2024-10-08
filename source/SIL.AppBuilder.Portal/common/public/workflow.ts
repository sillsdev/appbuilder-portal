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
 *  - If the flow has `UserRoleFeature.RequireApprovalProcess` it will include extra state to represent the organizational approval process
 *  - If the flow has `UserRoleFeature.RequireAdminConfiguration` it will not include those states, but there are still some states that require action from an OrgAdmin to complete certain actions
 *  - If the flow has `UserRoleFeature.None` none of the states or actions for the workflow instance will require an OrgAdmin.
 *
 * Any state or transition can have a list of specified `UserRoleFeature`s. What this means is that those states and transitions will be included in a workflow instance ONLY when the instance's `UserRoleFeature` is in the state's or transition's list.
 *
 * If a state or transition does not specify any `UserRoleFeature` it will be included (provided it passes other conditions not dependent on `UserRoleFeature`).
 */
export enum UserRoleFeature {
  None = 0,
  RequireAdminConfiguration,
  RequireApprovalProcess
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
  URFeatures: UserRoleFeature[];
  environment: BuildEnv;
  productType: ProductType;
};

// These are all specific to the Google Play workflows
// Not sure how these are used, but will figure out when integrating into backend
export type BuildEnv = {
  googlePlayDraft?: boolean;
  googlePlayExisting?: boolean;
  googlePlayUploaded?: boolean;
};

export type WorkflowInput = {
  URFeatures: UserRoleFeature[];
  productType: ProductType;
};

// TODO: Just put this info directly in the database
export function workflowInputFromDBProductType(workflowDefinitionId: number): WorkflowInput {
  switch (workflowDefinitionId) {
    case 1: // sil_android_google_play
      return {
        URFeatures: [
          UserRoleFeature.RequireApprovalProcess,
          UserRoleFeature.RequireAdminConfiguration
        ],
        productType: ProductType.Android_GooglePlay
      };
    case 4: // sil_android_s3
      return {
        URFeatures: [UserRoleFeature.RequireApprovalProcess],
        productType: ProductType.Android_S3
      };
    case 6: // la_android_google_play
      return {
        URFeatures: [UserRoleFeature.RequireAdminConfiguration],
        productType: ProductType.Android_GooglePlay
      };
    case 7: // na_android_google_play
      return {
        URFeatures: [UserRoleFeature.None],
        productType: ProductType.Android_GooglePlay
      };
    case 8: // na_android_s3
      return {
        URFeatures: [UserRoleFeature.None],
        productType: ProductType.Android_S3
      };
    case 9: // pwa_cloud
    case 11: // html_cloud
      return {
        URFeatures: [UserRoleFeature.None],
        productType: ProductType.Web
      };
    case 13: // asset_package
      return {
        URFeatures: [UserRoleFeature.None],
        productType: ProductType.AssetPackage
      };
    default: // would be some other workflow type presumably
      console.log(
        `Unrecognized workflow definition: ${workflowDefinitionId}! Returning configuration for sil_android_google_play.`
      );
      return {
        URFeatures: [
          UserRoleFeature.RequireApprovalProcess,
          UserRoleFeature.RequireAdminConfiguration
        ],
        productType: ProductType.Android_GooglePlay
      };
  }
}

/** Used for filtering based on AdminLevel and/or ProductType */
export type MetaFilter = {
  URFeatures?: UserRoleFeature[];
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
  context: WorkflowContext;
  input: WorkflowInput;
};
