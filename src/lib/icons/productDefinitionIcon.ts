const iconMap = {
  android: 'flat-color-icons:android-os',
  html: 'mdi:web',
  pwa: 'mdi:web',
  package: 'mdi:archive',
  none: 'mdi:error-outline'
} as const;
// Not sure I like this, but it's implemented here as it was in S1.
// I would suggest having a productDefinition db field for what type this is
// TODO: icon colors?
export function getIcon(name: string): (typeof iconMap)[keyof typeof iconMap] {
  return iconMap[
    (Object.keys(iconMap).find((key) =>
      name.toLowerCase().includes(key)
    ) as keyof typeof iconMap) ?? 'none'
  ];
}
