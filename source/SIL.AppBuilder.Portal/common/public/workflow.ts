import type { Prisma } from '@prisma/client';
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
 * Optional features of the workflow. Different states/transitions can be included based on provided options.
 */
export enum WorkflowOptions {
  /** Require an OrgAdmin to access the GooglePlay Developer Console */
  AdminStoreAccess = 1,
  /** Require approval from an OrgAdmin before product can be created */
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

export const TerminalStateFilter: Prisma.WorkflowInstancesWhereInput = {
  State: { in: [WorkflowState.Terminated, WorkflowState.Published] }
};

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

export type WorkflowContextBase = {
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
  // Not sure how this is used, but will figure out when integrating into backend
  environment: { [key: string]: any };
};

export type WorkflowContext = WorkflowContextBase & WorkflowInput;

export type WorkflowConfig = {
  options: WorkflowOptions[];
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
    | { any: WorkflowOptions[] } // options contains any of the provided
    | { all: WorkflowOptions[] } // options contains all of the provided
    | { none: WorkflowOptions[] }; // options contains none of the provided
  productType?:
    | { is: ProductType } // productType is the provided
    | { any: ProductType[] } // productType is any of the provided
    | { not: ProductType } // productType is not the provided
    | { none: ProductType[] }; // productType is none of the provided
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
export function filterMeta(config: WorkflowConfig, filter?: MetaFilter) {
  let include = !!filter;
  if (!filter) {
    return true; // no conditions are specified
  }
  if (include && filter.options) {
    if ('has' in filter.options) {
      // options contains the provided
      include &&= config.options.includes(filter.options.has);
    } else if ('any' in filter.options) {
      // options contains any of the provided
      let x = filter.options.any;
      include &&= !!config.options.find((o) => x.includes(o));
    } else if ('all' in filter.options) {
      // options contains all of the provided
      let x = Array.from(new Set(filter.options.all));
      include &&=
        Array.from(new Set(config.options.filter((o) => x.includes(o)))).length >= x.length;
    } else {
      // options contains none of the provided
      let x = filter.options.none;
      include &&= x.filter((o) => config.options.includes(o)).length < 1;
    }
  }
  if (include && filter.productType) {
    if ('is' in filter.productType) {
      // productType is the provided
      include &&= config.productType === filter.productType.is;
    } else if ('any' in filter.productType) {
      // productType is any of the provided
      include &&= filter.productType.any.includes(config.productType);
    } else if ('not' in filter.productType) {
      // productType is not the provided
      include &&= config.productType !== filter.productType.not;
    } else {
      // productType is none of the provided
      include &&= !filter.productType.none.includes(config.productType);
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

/**
 * @param params expected params of `canJump` guard from StartupWorkflow
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
  WorkflowStateMeta | WorkflowTransitionMeta
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
  state: string;
  context: WorkflowContextBase;
  config: WorkflowConfig;
};
