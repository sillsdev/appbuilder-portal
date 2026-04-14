import * as v from 'valibot';
import { AlternateCodes } from '$lib/google-play';

export function addBasicVariants(locales: Readonly<string[]>) {
  return new Set(locales.flatMap((locale) => [locale, getBasicVariant(locale)])).values().toArray();
}

export function getBasicVariant(locale: string) {
  return (locale.includes('-') && locale.split('-')[0]) || locale;
}

export type L10NMap<Locale extends string> = Map<Locale, L10NMapValue | null>;

export type L10NMapValue = { languages: Map<string, string>; territories?: Map<string, string> };

export const langtagSchema = v.object({
  tag: v.string(),
  localname: v.optional(v.string()),
  name: v.string(),
  // nameInLocale: not in the JSON
  // additional matches
  names: v.optional(v.array(v.string())),
  region: v.string(),
  regions: v.optional(v.array(v.string())),
  variants: v.optional(v.array(v.string()))
});

export type LangInfo = v.InferOutput<typeof langtagSchema>;

export function tryLocalize<Locale extends string>(
  lookup: L10NMap<Locale>,
  locale: Locale,
  namespace: 'languages' | 'territories',
  code: string,
  fallback: string
) {
  const locales = [
    locale,
    getBasicVariant(locale),
    AlternateCodes.get(locale),
    getBasicVariant(AlternateCodes.get(locale) ?? '')
  ].filter((l, i) => l && (i === 0 || l !== locale)) as Locale[];

  const codes =
    namespace === 'languages'
      ? ([
          code,
          getBasicVariant(code),
          AlternateCodes.get(code),
          getBasicVariant(AlternateCodes.get(code) ?? '')
        ].filter((l, i) => l && (i === 0 || l !== code)) as string[])
      : [code];

  for (const locale of locales) {
    const map = lookup.get(locale);
    if (map) {
      for (const code of codes) {
        const found = map[namespace]?.get(code);
        if (found) return found;
      }
    }
  }

  return fallback;
}

export function tryLocalizeName<Locale extends string>(
  data: LangInfo[],
  lookup: L10NMap<Locale>,
  locale: Locale,
  tag: string
) {
  return tryLocalize(
    lookup,
    locale,
    'languages',
    tag,
    data.find((l) => l.tag === tag)?.name || tag
  );
}

export function localizeTagData<Locale extends string>(
  data: LangInfo[],
  lookup: L10NMap<Locale>,
  locale: Locale
) {
  // TODO: localized separator
  return data.map((info) => ({
    names: (info.names ?? []).join(', '),
    localname: info.localname || info.name,
    name: info.name,
    variants: (info.variants ?? []).join(', '),
    tag: info.tag,
    // These are the only fields that need localization
    nameInLocale: tryLocalizeName(data, lookup, locale, info.tag),
    region: info.region && tryLocalize(lookup, locale, 'territories', info.region, info.region),
    regions: (
      info.regions?.map((region) => tryLocalize(lookup, locale, 'territories', region, region)) ??
      []
    ).join(', ')
  }));
}
