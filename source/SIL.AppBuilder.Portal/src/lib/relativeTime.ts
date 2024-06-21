import { locale } from "svelte-i18n";
import { get} from "svelte/store"
let relativeTimeFormatter = new Intl.RelativeTimeFormat(get(locale)!);
locale.subscribe((value) => {
  relativeTimeFormatter = new Intl.RelativeTimeFormat(value!);
});
export function getRelativeTime(date: Date) {
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
    if (Math.abs(elapsed) > units[u as keyof typeof units] || u == 'second')
      return relativeTimeFormatter.format(
        Math.round(elapsed / units[u as keyof typeof units]),
          u as keyof typeof units
      );
  }
}
