import { SvelteMap } from 'svelte/reactivity';
import * as v from 'valibot';
import type { Locale } from './paraglide/runtime';
import type { m } from '$lib/paraglide/messages';
import type { Entries, ValidKey } from '$lib/utils';

export type ValidI13nKey = ValidKey<typeof m>;
export type ValueKey<T extends ValidI13nKey = ValidI13nKey> = {
  key: T;
  params?: Parameters<(typeof m)[T]>[0];
  classes?: string;
};

export type L10NKeys = 'languages' | 'territories';

export type L10NEntries = Entries<Locale, Entries<L10NKeys, Entries<string, string>> | null>;

/**
 * I hate how hacky this is, but apparently this is how Svelte 5 works for importing a rune.
 * Svelte/TS don't allow directly assigning to an import.
 * Since Svelte 5 runes uses proxies for objects, assigning to a property works instead.
 */
export const l10nMap = $state({ value: createl10nMapFromEntries([]) });

export function createl10nMapFromEntries(entries: L10NEntries) {
  return new SvelteMap(
    entries.map(([tag, localizations]) => [
      tag,
      localizations
        ? new SvelteMap(
            localizations.map(([l10nKey, localEntries]) => [l10nKey, new SvelteMap(localEntries)])
          )
        : null
    ])
  );
}

type L10NMap = ReturnType<typeof createl10nMapFromEntries>;

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

function tryLocalize(
  lookup: L10NMap,
  locale: Locale,
  namespace: L10NKeys,
  str: string,
  name: string
) {
  return lookup.get(locale)?.get(namespace)?.get(str) || name;
}

export function tryLocalizeName(data: LangInfo[], lookup: L10NMap, locale: Locale, tag: string) {
  return tryLocalize(
    lookup,
    locale,
    'languages',
    tag,
    data.find((l) => l.tag === tag)?.name || tag
  );
}

export function localizeTagData(data: LangInfo[], lookup: L10NMap, locale: Locale) {
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
