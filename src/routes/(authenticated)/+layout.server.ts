import { parse } from 'devalue';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { array, safeParse } from 'valibot';
import type { LayoutServerLoad } from './$types';
import { langtagSchema } from '$lib/ldml';
import { readLDML } from '$lib/ldml/server';
import { locales } from '$lib/paraglide/runtime';
import { getUserTasks } from '$lib/projects/sse';
import { QueueConnected } from '$lib/server/bullmq/queues';
import { DatabaseReads } from '$lib/server/database';

export const load: LayoutServerLoad = async (event) => {
  event.locals.security.requireAuthenticated();
  const sec = event.locals.security;
  const organizations = await DatabaseReads.organizations.findMany({
    where: sec.isSuperAdmin
      ? undefined
      : {
          Id: { in: sec.organizationMemberships }
        },
    select: {
      Id: true,
      Name: true,
      LogoUrl: true,
      ContactEmail: true
    }
  });

  const localDir = join(process.cwd(), 'languages');

  return {
    organizations,
    userTasks: await getUserTasks(sec.userId),
    // streaming promise
    langtags: await readFile(join(localDir, 'langtags.dev'))
      .then((j) => {
        const res = safeParse(array(langtagSchema), parse(j.toString()));
        return res.success ? res.output : [];
      })
      .catch((r) => {
        console.error(r);
        return [];
      }),
    l10nMap: await readLDML(localDir, locales),
    jobsAvailable: QueueConnected()
  };
};
