import type { Locale } from '$lib/paraglide/runtime';
import { ApplicationType, RoleId, StoreType, WorkflowType } from '$lib/prisma';
import { ProductActionType } from '$lib/products';
import { ProductType, WorkflowAction } from '$lib/workflowTypes';

export function getActionIcon(type: ProductActionType) {
  switch (type) {
    case ProductActionType.Rebuild:
      return 'carbon:build-run';
    case ProductActionType.Republish:
      return 'carbon:ibm-elo-publishing';
    case ProductActionType.Cancel:
      return 'mdi:cancel-octagon';
  }
}

const appIcons = import.meta.glob('/src/lib/icons/app-builders/*.svg', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

export function getAppIcon(type: ApplicationType) {
  return (
    appIcons[
      `/src/lib/icons/app-builders/${typeof type === 'string' ? type : ApplicationType[type]}.svg`
    ] ?? ''
  );
}

export function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'aab':
    case 'apk':
      return getProductIcon(ProductType.Android_GooglePlay);
    case 'version_code':
    case 'version':
      return 'mdi:tag';
    case 'play-listing':
    case 'asset-preview':
      return Icons.Web;
    case 'about':
    case 'play-listing-manifest':
    case 'package_name':
    case 'whats_new':
      return Icons.Info;
    case 'cloudWatch':
    case 'consoleText':
      return 'mdi:console';
    case 'html':
    case 'pwa':
    case 'asset-package':
    case 'play-listing-download':
      return Icons.Archive;
    case 'encrypted_key':
      return Icons.Key;
    case 'data-safety-csv':
      return 'mingcute:safety-certificate-fill';
    case 'publish_properties':
    case 'asset-notify':
    default:
      return Icons.File;
  }
}

export function getFlagIcon(locale: Locale) {
  switch (locale) {
    case 'en-US':
      return 'circle-flags:us';
    case 'es-419':
      return 'circle-flags:mx';
    case 'fr-FR':
      return 'circle-flags:fr';
    default:
      console.warn(`Unrecognized language tag ${locale} in getFlag, using default flag.`);
      return 'circle-flags:un'; // UN flag as fallback
  }
}

export function getProductIcon(type: ProductType) {
  switch (type) {
    case ProductType.Web:
      return 'mdi:web';
    case ProductType.AssetPackage:
      return 'mdi:archive';
    default:
      return 'flat-color-icons:android-os';
  }
}

export function getRoleIcon(role: RoleId) {
  switch (role) {
    case RoleId.SuperAdmin:
    case RoleId.OrgAdmin:
      return 'eos-icons:admin';
    case RoleId.AppBuilder:
      return 'mdi:worker';
    case RoleId.Author:
      return 'mdi:pencil';
  }
}

export function getStoreIcon(type: StoreType) {
  switch (type) {
    case StoreType.GooglePlay:
      return 'logos:google-play-icon';
    case StoreType.S3:
      return 'logos:aws-s3';
    case StoreType.Cloud:
      return 'material-symbols:cloud';
    default:
      return 'ic:twotone-store';
  }
}

export function getWorkflowIcon(type: WorkflowType) {
  switch (type) {
    case WorkflowType.Startup:
      return 'majesticons:rocket-3-start-line';
    case WorkflowType.Rebuild:
      return 'carbon:build-run';
    case WorkflowType.Republish:
      return 'carbon:ibm-elo-publishing';
    default:
      return '';
  }
}

export function getWorkflowActionIcon(type: WorkflowAction) {
  switch (type) {
    case WorkflowAction.Continue:
      return 'wordpress:next';
    case WorkflowAction.Approve:
      return 'mdi:approve';
    case WorkflowAction.Hold:
      return 'gridicons:pause';
    case WorkflowAction.Reject:
      return 'mdi:cancel';
    case WorkflowAction.Jump:
      return 'mdi:jump';
    case WorkflowAction.New_App:
      return 'mingcute:file-new-line';
    case WorkflowAction.Existing_App:
      return Icons.GooglePlay;
    case WorkflowAction.Transfer_to_Authors:
      return Icons.Transfer;
    case WorkflowAction.Take_Back:
      return 'icon-park-outline:return';
    case WorkflowAction.Email_Reviewers:
      return Icons.Email;
    default:
      return '';
  }
}

export const Icons = {
  Active: 'hugeicons:activity-03',
  AddAuthor: 'mdi:pencil-add',
  AddGeneric: 'material-symbols:add',
  AddGroup: 'fluent-mdl2:add-group',
  AddProduct: 'system-uicons:box-add',
  AddProject: 'material-symbols:add-card-outline',
  AddReviewer: 'mdi:eye-add',
  AddStore: 'hugeicons:store-add-02',
  AddStoreType: 'hugeicons:store-add-01',
  AddUser: 'mdi:user-add',
  AddUsers: 'material-symbols:group-add',
  Archive: 'material-symbols:archive',
  Back: 'mdi:arrow-left',
  BuildEngine: 'carbon:build-image',
  Cancel: 'icon-park-outline:return',
  Checkmark: 'mdi:check',
  Close: 'mdi:close',
  Copy: 'mdi:content-copy',
  Dashboard: 'clarity:dashboard-line',
  DateRange: 'material-symbols:date-range',
  Directory: 'lsicon:folder-files-filled',
  Download: 'material-symbols:download',
  DownloadOff: 'material-symbols:file-download-off',
  Dropdown: 'gridicons:dropdown',
  Edit: 'mdi:pencil',
  Email: 'ic:baseline-email',
  Empty: '',
  File: 'mdi:file',
  Forum: 'charm:messages',
  GearOff: 'pepicons-pop:gear-off',
  GearOn: 'pepicons-pop:gear',
  GooglePlay: 'mdi:google-play',
  Group: 'mdi:user-group',
  Hamburger: 'mdi:hamburger-menu',
  Help: 'material-symbols:help',
  Image: 'material-symbols:image',
  Import: 'tdesign:import',
  Info: 'mdi:info',
  InfoOutline: 'mdi:information-outline',
  Invisible: 'mdi:eye-off-outline',
  Kebab: 'charm:menu-kebab',
  Key: 'material-symbols:key',
  Language: 'mdi:language',
  Locked: 'mdi:lock',
  LogOut: 'mdi:sign-out',
  Name: 'mdi:rename',
  NotifyOff: 'iconamoon:notification-off',
  NotifyOn: 'iconamoon:notification-fill',
  Open: 'mdi:open-in-new',
  Organization: 'clarity:organization-solid',
  Phone: 'ic:baseline-phone',
  Product: 'system-uicons:box',
  Project: 'material-symbols:credit-card-outline',
  Publish: 'material-symbols:publish',
  ReactivateProject: 'mdi:archive-refresh',
  RefreshOff: 'lucide:refresh-cw-off',
  RefreshOn: 'lucide:refresh-cw',
  Reset: 'ri:reset-right-line',
  Roles: 'oui:app-users-roles',
  Save: 'material-symbols:save-outline',
  Search: 'mdi:search',
  Send: 'material-symbols:send',
  Settings: 'material-symbols:settings',
  SortDesc: 'bx:sort-z-a',
  SortAsc: 'bx:sort-a-z',
  Star: 'material-symbols:star',
  Store: 'ic:twotone-store',
  StoreMenu: 'hugeicons:store-04',
  StoreTypeMenu: 'hugeicons:store-management-01',
  Tasks: 'grommet-icons:task',
  Timezone: 'mdi:timezone',
  Transfer: 'bx:transfer',
  Trash: 'mdi:trash',
  Unlocked: 'mdi:lock-open-variant',
  UpdateOff: 'ic:baseline-update-disabled',
  UpdateOn: 'ic:baseline-update',
  URL: 'solar:link-bold',
  User: 'mdi:user',
  Visible: 'mdi:eye',
  Web: 'mdi:web',
  Workflow: 'hugeicons:workflow-square-03'
} as const;

export type IconType =
  | (typeof Icons)[keyof typeof Icons]
  | ReturnType<
      | typeof getActionIcon
      | typeof getFileIcon
      | typeof getFlagIcon
      | typeof getProductIcon
      | typeof getRoleIcon
      | typeof getStoreIcon
      | typeof getWorkflowIcon
      | typeof getWorkflowActionIcon
    >;
