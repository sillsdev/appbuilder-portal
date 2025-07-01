import { readable, type Readable } from 'svelte/store';
import { getLocale } from '../paraglide/runtime';

let locale = getLocale();
let relativeTimeFormatter = new Intl.RelativeTimeFormat(locale);

type DateType = Date | string | null;
export function getRelativeTime(date: DateType): Readable<string>;
export function getRelativeTime(date: DateType[]): Readable<string[]>;
export function getRelativeTime(date: DateType | DateType[]): Readable<string | string[]> {
  if (Array.isArray(date)) {
    return readable(
      date.map((d) => getRelativeTimeValue(d)),
      (set) => {
        const interval = setInterval(() => {
          set(date.map((d) => getRelativeTimeValue(d)));
        }, 1000);
        return () => clearInterval(interval);
      }
    );
  }
  return readable(getRelativeTimeValue(date), (set) => {
    const interval = setInterval(() => {
      set(getRelativeTimeValue(date));
    }, 1000);
    return () => clearInterval(interval);
  });
}
export function getRelativeTimeValue(date: DateType): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  if (!date) return '-';
  if (locale !== getLocale()) {
    locale = getLocale();
    relativeTimeFormatter = new Intl.RelativeTimeFormat(locale);
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
export function getTimeDateString(date: DateType): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return `${date?.toLocaleDateString(getLocale()) ?? '-'} ${
    date
      ?.toLocaleTimeString(getLocale(), {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      .replace(' ', '\xa0') ?? ''
  }`;
}
