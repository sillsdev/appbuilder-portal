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
