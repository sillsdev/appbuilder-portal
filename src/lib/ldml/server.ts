import { parse } from 'devalue';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { L10NMap, L10NMapValue } from '.';

export async function readLDML<Locale extends string>(
  localDir: string,
  locales: Readonly<Locale[]>
): Promise<L10NMap<Locale>> {
  return new Map(
    await Promise.all(
      locales.map(async (locale) => {
        const filePath = join(localDir, locale, 'ldml.dev');

        let ret = null;
        if (existsSync(filePath)) {
          const file = (await readFile(filePath)).toString();
          ret = parse(file) as L10NMapValue;
        }
        return [locale, ret] as [Locale, typeof ret];
      })
    )
  );
}
