import en from './en-us.json' with { type: 'json' };
import es from './es-419.json' with { type: 'json' };
import fr from './fr-FR.json' with { type: 'json' };

function getValueFromKey(key: string, map): string {
  return key.split('.').reduce((acc, k) => acc[k], map);
}

const notificationSubjectKeys = Object.keys(en.notifications.subject);

export function getOwnerAdminVariantKeys(key: string): { owner: string; admin: string } {
  return notificationSubjectKeys.find((k) => k.startsWith(key)) === key
    ? { owner: key, admin: key }
    : { owner: key + 'Owner', admin: key + 'Admin' };
}

type DeepKeys<T extends Record<string, unknown>> = {
  [K in keyof T]: K extends string
    ? T[K] extends Record<string, unknown>
      ? `${K}.${DeepKeys<T[K]>}`
      : K
    : never;
}[keyof T];
export function translate<T extends DeepKeys<typeof en>>(
  locale: 'en' | 'es-419' | 'fr-FR',
  key: T,
  options?: Record<string, string>
): string;
export function translate(locale: string, key: string, options?: Record<string, string>): string;
export function translate(
  locale: string,
  key: string,
  options: Record<string, string> = {}
): string {
  let translation: string;
  switch (locale) {
    case 'es-419':
      translation = getValueFromKey(key, es);
      break;
    case 'fr-FR':
      translation = getValueFromKey(key, fr);
      break;
  }
  translation ??= getValueFromKey(key, en);
  return Object.entries(options).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, 'g'), value),
    translation
  );
}
