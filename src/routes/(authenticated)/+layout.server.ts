import { error } from '@sveltejs/kit';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { safeParse } from 'valibot';
import type { LayoutServerLoad } from './$types';
import { type L10NEntries, type L10NKeys, langtagsSchema } from '$lib/locales.svelte';
import { type Locale, locales } from '$lib/paraglide/runtime';
import { QueueConnected } from '$lib/server/bullmq/queues';
import { DatabaseReads } from '$lib/server/database';
import type { Entries } from '$lib/utils';
import { isSuperAdmin } from '$lib/utils/roles';

export const load: LayoutServerLoad = async (event) => {
  if (event.locals.error) {
    // If there is an error, we throw it to be handled by the error page
    error(event.locals.error);
  }
  const user = (await event.locals.auth())!.user;
  const numberOfTasks = (
    await DatabaseReads.userTasks.findMany({
      where: {
        UserId: user.userId
      },
      select: {
        Id: true
      },
      distinct: 'ProductId'
    })
  ).length;
  const organizations = await DatabaseReads.organizations.findMany({
    where: isSuperAdmin(user.roles)
      ? undefined
      : {
          OrganizationMemberships: {
            some: {
              UserId: user.userId
            }
          }
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
    numberOfTasks,
    // streaming promise
    langtags: await readFile(join(localDir, 'langtags.json'))
      .then((j) => {
        const res = safeParse(langtagsSchema, JSON.parse(j.toString()));
        return res.success ? res.output : [];
      })
      .catch((r) => {
        console.log(r);
        return [];
      }),
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
    )) as L10NEntries,
    jobsAvailable: QueueConnected()
  };
};
