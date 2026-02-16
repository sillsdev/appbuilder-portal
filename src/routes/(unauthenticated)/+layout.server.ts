import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { LayoutServerLoad } from './$types';
import { type L10NEntries, type L10NKeys } from '$lib/locales.svelte';
import { type Locale, locales } from '$lib/paraglide/runtime';
import type { Entries } from '$lib/utils';

export const load: LayoutServerLoad = async (event) => {
  event.locals.security.requireNothing();
  const localDir = join(process.cwd(), 'languages');

  return {
    localizedNames: (await Promise.all(
      locales.map(async (locale) => {
        const filePath = join(localDir, locale, 'ldml.json');

        let ret = null;
        if (existsSync(filePath)) {
          const file = (await readFile(filePath)).toString();
          ret = JSON.parse(file) as Entries<L10NKeys, Entries<string, string>>;
        }
        return [locale, ret] as [Locale, typeof ret];
      })
    )) as L10NEntries
  };
};
