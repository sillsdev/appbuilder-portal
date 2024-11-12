import { languageTag } from './paraglide/runtime';

let langtag = languageTag();
let relativeTimeFormatter = new Intl.RelativeTimeFormat(langtag);
export function getRelativeTime(date: Date | null) {
  if (!date) return '-';
  if (langtag !== languageTag()) {
    langtag = languageTag();
    relativeTimeFormatter = new Intl.RelativeTimeFormat(langtag);
  }
  // in miliseconds
  const units = {
    year: 24 * 60 * 60 * 1000 * 365,
    month: (24 * 60 * 60 * 1000 * 365) / 12,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
  } as const;

  const elapsed = date.valueOf() - new Date().valueOf();
  for (const u in units) {
    if (Math.abs(elapsed) > units[u as keyof typeof units] || u == 'second') {
      const ret = relativeTimeFormatter.format(
        Math.round(elapsed / units[u as keyof typeof units]),
        u as keyof typeof units
      );
      return ret;
    }
  }
  return 'ERROR';
}
export function getTimeDateString(date: Date | null) {
  return `${date?.toLocaleDateString(languageTag()) ?? '-'} ${
    date
      ?.toLocaleTimeString(languageTag(), {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      .replace(' ', '\xa0') ?? ''
  }`;
}
