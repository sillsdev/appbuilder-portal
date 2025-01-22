import { and, type TransitionConfig } from 'xstate';
import type { RoleId } from './prisma.js';

export enum ActionType {
  /** Automated Action */
  Auto = 0,
  /** User-initiated Action */
  User
}

/**
 * Optional features of the workflow. Different states/transitions can be included based on provided options.
 */
export enum WorkflowOptions {
  /** Require an OrgAdmin to access the GooglePlay Developer Console */
  AdminStoreAccess = 1,
  /** Require approval from an OrgAdmin before product can be created */
  ApprovalProcess,
  /** Allow Owner to delegate actions to Authors */
  AllowTransferToAuthors
}

export enum ProductType {
  Android_GooglePlay = 0,
  Android_S3,
  AssetPackage,
  Web
}

export enum WorkflowState {
  Start = 'Start',
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

export const TerminalStates = [WorkflowState.Terminated, WorkflowState.Published];

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

export type WorkflowInstanceContext = {
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
  environment: Environment;
};

export type Environment = { [key: ENVKeys | string]: string };

export enum ENVKeys {
  // Set by Workflow
  PUBLISH_GOOGLE_PLAY_UPLOADED_BUILD_ID = 'PUBLISH_GOOGLE_PLAY_UPLOADED_BUILD_ID',
  PUBLISH_GOOGLE_PLAY_UPLOADED_VERSION_CODE = 'PUBLISH_GOOGLE_PLAY_UPLOADED_VERSION_CODE',
  GOOGLE_PLAY_EXISTING = 'GOOGLE_PLAY_EXISTING',
  GOOGLE_PLAY_DRAFT = 'GOOGLE_PLAY_DRAFT',
  // Before Build
  UI_URL = 'UI_URL',
  PRODUCT_ID = 'PRODUCT_ID',
  PROJECT_ID = 'PROJECT_ID',
  PROJECT_NAME = 'PROJECT_NAME',
  PROJECT_DESCRIPTION = 'PROJECT_DESCRIPTION',
  PROJECT_URL = 'PROJECT_URL',
  PROJECT_LANGUAGE = 'PROJECT_LANGUAGE',
  PROJECT_ORGANIZATION = 'PROJECT_ORGANIZATION',
  PROJECT_OWNER_NAME = 'PROJECT_OWNER_NAME',
  PROJECT_OWNER_EMAIL = 'PROJECT_OWNER_EMAIL'
}

export type WorkflowContext = WorkflowInstanceContext & WorkflowInput;

export type WorkflowConfig = {
  options: Set<WorkflowOptions>;
  productType: ProductType;
};

export type WorkflowInput = WorkflowConfig & {
  productId: string;
  hasAuthors: boolean;
  hasReviewers: boolean;
};

/** Used for filtering based on specified WorkflowOptions and/or ProductType */
export type MetaFilter = {
  options?:
    | { has: WorkflowOptions } // options contains the provided
    | { any: Set<WorkflowOptions> } // options contains any of the provided
    | { all: Set<WorkflowOptions> } // options contains all of the provided
    | { none: Set<WorkflowOptions> }; // options contains none of the provided
  productType?:
    | { is: ProductType } // productType is the provided
    | { any: Set<ProductType> } // productType is any of the provided
    | { not: ProductType } // productType is not the provided
    | { none: Set<ProductType> }; // productType is none of the provided
};

export type WorkflowStateMeta = { includeWhen?: MetaFilter };

export type WorkflowTransitionMeta = {
  type: ActionType;
  user?: RoleId;
  includeWhen?: MetaFilter;
};

/**
 * Include state/transition if:
 *  - no conditions are specified
 *  - all specified conditions are met
 */
export function includeStateOrTransition(config: WorkflowConfig, filter?: MetaFilter) {
  let include = !!filter;
  if (!filter) {
    return true; // no conditions are specified
  }
  if (include && filter.options) {
    if ('has' in filter.options) {
      // options contains the provided
      include &&= config.options.has(filter.options.has);
    } else if ('any' in filter.options) {
      // options contains any of the provided
      include &&= !config.options.isDisjointFrom(filter.options.any);
    } else if ('all' in filter.options) {
      // options contains all of the provided
      include &&= config.options.isSupersetOf(filter.options.all);
    } else {
      // options contains none of the provided
      include &&= config.options.isDisjointFrom(filter.options.none);
    }
  }
  if (include && filter.productType) {
    if ('is' in filter.productType) {
      // productType is the provided
      include &&= config.productType === filter.productType.is;
    } else if ('any' in filter.productType) {
      // productType is any of the provided
      include &&= filter.productType.any.has(config.productType);
    } else if ('not' in filter.productType) {
      // productType is not the provided
      include &&= config.productType !== filter.productType.not;
    } else {
      // productType is none of the provided
      include &&= !filter.productType.none.has(config.productType);
    }
  }
  return include;
}

export type WorkflowEvent = {
  type: WorkflowAction;
  comment?: string;
  target?: WorkflowState;
  userId: number | null;
};

export type JumpParams = {
  target: WorkflowState | string;
  filter?: MetaFilter;
};

export function canJump(args: { context: WorkflowContext }, params: JumpParams): boolean {
  return (
    args.context.start === params.target && includeStateOrTransition(args.context, params.filter)
  );
}
export function hasAuthors(args: { context: WorkflowContext }): boolean {
  return args.context.hasAuthors;
}
export function hasReviewers(args: { context: WorkflowContext }): boolean {
  return args.context.hasReviewers;
}
/**
 * @param params expected params of `canJump` guard from StartupWorkflow
 * @param optionalGuards other guards that can optionally be added.
 * @returns A properly configured object for the `always` array of the `Start` state for jumping to an arbitrary state.
 */
export function jump(
  params: JumpParams,
  optionalGuards?: (typeof hasAuthors | typeof hasReviewers)[]
): TransitionConfig<
  WorkflowContext,
  WorkflowEvent,
  WorkflowEvent,
  never,
  never,
  never,
  never,
  WorkflowEvent,
  WorkflowStateMeta | WorkflowTransitionMeta
> | string {
  const j = (args: { context: WorkflowContext}) => canJump(args, params);
  return {
    guard: optionalGuards ? and(optionalGuards.concat([j])) : j,
    target: params.target
  };
}

export type StateNode = {
  id: number;
  label: string; // TODO: i18n (after MVP)
  connections: { id: number; target: string; label: string }[];
  inCount: number;
  start?: boolean;
  final?: boolean;
  action?: boolean;
};

export type Snapshot = {
  instanceId: number;
  definitionId: number;
  state: string;
  context: WorkflowInstanceContext;
  config: WorkflowConfig;
};
