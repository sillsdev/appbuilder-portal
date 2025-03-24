import { i18n } from '$lib/i18n';
import type { Entries } from '$lib/utils';
import * as v from 'valibot';

export type l10nKeys = 'languages' | 'territories';

type AvailableTag = (typeof i18n.config.runtime.availableLanguageTags)[number];

export type l10nEntries = Entries<AvailableTag, Entries<l10nKeys, Entries<string, string>> | null>;

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

export function localizeTagData(data: LangInfo[], lookup: l10nMap, langTag: AvailableTag) {
  const tryLocalize = (namespace: l10nKeys, str: string, name: string) =>
    lookup.get(langTag)?.get(namespace)?.get(str) || name;

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
