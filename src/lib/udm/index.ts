import { type Locale, locales } from './paraglide/runtime';

export const AlternateCodes = new Map<Locale, Locale>([
  /* `iw-IL` is still used by GooglePlay, even though `he` is the most recent ISO 639 code */
  ['iw-IL', 'he' as Locale]
]) as ReadonlyMap<Locale, Locale>;

export function withAlternates() {
  return locales.concat(AlternateCodes.values().toArray());
}
