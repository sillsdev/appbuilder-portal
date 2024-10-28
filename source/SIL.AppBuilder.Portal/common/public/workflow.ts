import type { RoleId } from './prisma.js';
import { and, type TransitionConfig } from 'xstate';
import type { GuardPredicate } from 'xstate/guards';

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

export enum WorkflowState {
  Start = 'Start',
  Readiness_Check = 'Readiness Check',
  Approval = 'Approval',
  Approval_Pending = 'Approval Pending',
  Terminated = 'Terminated',
  Product_Creation = 'Product Creation',
  App_Builder_Configuration = 'App Builder Configuration',
  Author_Configuration = 'Author Configuration',
  Synchronize_Data = 'Synchronize Data',
  Author_Download = 'Author Download',
  Author_Upload = 'Author Upload',
  Product_Build = 'Product Build',
  App_Store_Preview = 'App Store Preview',
  Create_App_Store_Entry = 'Create App Store Entry',
  Verify_and_Publish = 'Verify and Publish',
  Product_Publish = 'Product Publish',
  Make_It_Live = 'Make It Live',
  Published = 'Published'
}

export enum WorkflowAction {
  Default = 'Default',
  Continue = 'Continue',
  Approve = 'Approve',
  Hold = 'Hold',
  Reject = 'Reject',
  Jump = 'Jump',
  Product_Created = 'Product Created',
  New_App = 'New App',
  Existing_App = 'Existing App',
  Transfer_to_Authors = 'Transfer to Authors',
  Take_Back = 'Take Back',
  Build_Successful = 'Build Successful',
  Build_Failed = 'Build Failed',
  Email_Reviewers = 'Email Reviewers',
  Publish_Completed = 'Publish Completed',
  Publish_Failed = 'Publish Failed'
}

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
  start?: WorkflowState;
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
  type: WorkflowAction;
  comment?: string;
  target?: WorkflowState;
  userId: number | null;
};

export type JumpParams = {
  target: WorkflowState | string;
  products?: ProductType[];
  adminRequirements?: WorkflowAdminRequirements[];
};

/**
 * @param params expected params of `canJump` guard from DefaultWorkflow
 * @param optionalGuards other guards that can optionally be added.
 * @returns A properly configured object for the `always` array of the `Start` state for jumping to an arbitrary state.
 */
export function jump(
  params: JumpParams,
  optionalGuards?: GuardPredicate<WorkflowContext, WorkflowEvent, unknown, any>[]
): TransitionConfig<
  WorkflowContext,
  WorkflowEvent,
  WorkflowEvent,
  never,
  never,
  any,
  never,
  WorkflowEvent,
  MetaFilter | WorkflowTransitionMeta
> {
  const j = {
    type: 'canJump',
    params: params
  };
  return {
    //@ts-expect-error
    guard: optionalGuards ? and(optionalGuards.concat([j])) : j,
    target: params.target
  };
}

export type StateNode = {
  id: number;
  label: string; // TODO: i18n?
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
