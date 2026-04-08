import * as v from 'valibot';

export function addBasicVariants(locales: Readonly<string[]>) {
  return new Set(locales.flatMap((locale) => [locale, getBasicVariant(locale)])).values().toArray();
}

export function getBasicVariant(locale: string) {
  return (locale.includes('-') && locale.split('-')[0]) || locale;
}

export type L10NMap<Locale extends string> = Map<Locale, L10NMapValue | null>;

export type L10NMapValue = { languages: Map<string, string>; territories?: Map<string, string> };

export const langtagsSchema = v.array(
  v.object({
    tag: v.string(),
    localname: v.optional(v.string()),
    name: v.string(),
    // nameInLocale: not in the JSON
    // additional matches
    names: v.optional(v.array(v.string())),
    region: v.string(),
    regions: v.optional(v.array(v.string())),
    variants: v.optional(v.array(v.string()))
  })
);

export type LangInfo = v.InferOutput<typeof langtagsSchema>[number];

export function tryLocalize<Locale extends string>(
  lookup: L10NMap<Locale>,
  locale: Locale,
  namespace: 'languages' | 'territories',
  code: string,
  fallback: string
) {
  const basicLocale = getBasicVariant(locale) as Locale;
  const basicCode = getBasicVariant(code);
  const checkBasicCode = code !== basicCode;

  const map = lookup.get(locale)?.[namespace];
  const basicMap =
    locale !== basicLocale && lookup.get(getBasicVariant(locale) as Locale)?.[namespace];

  return (
    map?.get(code) ||
    (checkBasicCode && map?.get(basicCode)) ||
    (basicMap && basicMap.get(code)) ||
    (checkBasicCode && basicMap && basicMap.get(basicCode)) ||
    fallback
  );
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
