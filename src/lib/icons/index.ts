import type { ProductActionType } from '$lib/products';
const iconMap = {
  android: 'flat-color-icons:android-os',
  html: 'mdi:web',
  pwa: 'mdi:web',
  package: 'mdi:archive',
  none: 'mdi:error-outline'
};
// Not sure I like this, but it's implemented here as it was in S1.
// I would suggest having a productDefinition db field for what type this is
// TODO: icon colors?
export function getProductIcon(name: string) {
  return iconMap[
    (Object.keys(iconMap).find((key) =>
      name.toLowerCase().includes(key)
    ) as keyof typeof iconMap) ?? 'none'
  ];
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
