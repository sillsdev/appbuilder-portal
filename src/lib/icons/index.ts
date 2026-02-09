import { ProductActionType } from '$lib/products';

export function getActionIcon(type: ProductActionType) {
  switch (type) {
    case ProductActionType.Rebuild:
      return 'carbon:build-run';
    case ProductActionType.Republish:
      return 'carbon:ibm-elo-publishing';
    case ProductActionType.Cancel:
      return 'mdi:cancel-octagon';
    default:
      return '';
  }
}
