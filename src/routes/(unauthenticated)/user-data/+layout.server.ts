import { join } from 'path';
import type { LayoutServerLoad } from './$types';
import { readLDML } from '$lib/ldml/server';
import { DatabaseReads } from '$lib/server/database';
import { withAlternates } from '$lib/udm';

export const load: LayoutServerLoad = async (event) => {
  event.locals.security.requireNothing();

  const localDir = join(process.cwd(), 'languages', 'udm');

  return {
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
