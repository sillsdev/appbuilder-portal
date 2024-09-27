import type { RoleId } from './prisma.js';

export enum ActionType {
  /** Automated Action */
  Auto = 0,
  /** User-initiated Action */
  User
}

export enum WorkflowAdminLevel {
  /** NoAdmin/OwnerAdmin */
  None = 0,
  /** LowAdmin */
  Low,
  /** Approval required */
  High
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
  adminLevel: WorkflowAdminLevel;
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
  adminLevel: WorkflowAdminLevel;
  productType: ProductType;
};

/** Used for filtering based on AdminLevel and/or ProductType */
export type MetaFilter = {
  level?: WorkflowAdminLevel[];
  product?: ProductType[];
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
