import { ApplicationType, StoreType } from '$lib/prisma';
import type { ProductActionType } from '$lib/products';
import { ProductType } from '$lib/workflowTypes';

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

export function getActionIcon(type: ProductActionType) {
  switch (type) {
    case 'rebuild':
      return 'carbon:build-run';
    case 'republish':
      return 'carbon:ibm-elo-publishing';
    case 'cancel':
      return 'mdi:cancel-octagon';
    default:
      return '';
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

const appIcons = import.meta.glob('/src/lib/icons/app-builders/*.svg', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

export function getAppIcon(type: ApplicationType) {
  return appIcons[
    `/src/lib/icons/app-builders/${typeof type === 'string' ? type : ApplicationType[type]}.svg`
  ];
}
