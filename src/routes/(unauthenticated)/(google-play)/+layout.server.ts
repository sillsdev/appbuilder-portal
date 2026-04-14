import { join } from 'path';
import type { LayoutServerLoad } from './downloads/$types';
import { withAlternates } from '$lib/google-play';
import { readLDML } from '$lib/ldml/server';
import { DatabaseReads } from '$lib/server/database';

export const load: LayoutServerLoad = async (event) => {
  event.locals.security.requireNothing();

  const localDir = join(process.cwd(), 'languages', 'google-play');

  return {
    locale: event.locals.locale,
    l10nMap: await readLDML(localDir, withAlternates()),
    fallbacks: new Map(
      (
        await DatabaseReads.storeLanguages.findMany({
          select: {
            Name: true,
            Description: true
          }
        })
      ).map((l) => [l.Name, l.Description])
    )
  };
};
