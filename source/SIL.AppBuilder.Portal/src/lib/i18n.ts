import { m } from '$lib/paraglide/messages';
import type { Entries } from '$lib/utils';
import * as v from 'valibot';
import type { Locale } from './paraglide/runtime';

type ValidKey<T extends object> = {
  [K in keyof T]: T[K] extends () => void ? K : never;
}[keyof T];
export type ValidI13nKey = ValidKey<typeof m>;

export type l10nKeys = 'languages' | 'territories';

export type l10nEntries = Entries<Locale, Entries<l10nKeys, Entries<string, string>> | null>;

export function createl10nMapFromEntries(entries: l10nEntries) {
  return new Map(
    entries.map(([tag, localizations]) => [
      tag,
      localizations
        ? new Map(localizations.map(([l10nKey, localEntries]) => [l10nKey, new Map(localEntries)]))
        : null
    ])
  );
}

type l10nMap = ReturnType<typeof createl10nMapFromEntries>;

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
    variants: v.optional(v.array(v.string())),
  })
);

export type LangInfo = v.InferOutput<typeof langtagsSchema>[number];

export function localizeTagData(data: LangInfo[], lookup: l10nMap, locale: Locale) {
  const tryLocalize = (namespace: l10nKeys, str: string, name: string) =>
    lookup.get(locale)?.get(namespace)?.get(str) || name;

  // TODO: localized separator
  return data.map((info) => ({
    names: (info.names ?? []).join(", "),
    localname: info.localname || info.name,
    name: info.name,
    variants: (info.variants ?? []).join(", "),
    tag: info.tag,
    // These are the only fields that need localization
    nameInLocale: tryLocalize('languages', info.tag, info.name),
    region: info.region && tryLocalize('territories', info.region, info.region),
    regions: (
      info.regions?.map((region) => tryLocalize('territories', region, region)) ?? []
    ).join(", ")
  }));
}

