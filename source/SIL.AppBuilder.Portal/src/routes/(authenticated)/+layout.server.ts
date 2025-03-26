import { locales, type Locale } from '$lib/paraglide/runtime';
import type { Entries } from '$lib/utils';
import { langtagsSchema, type l10nEntries, type l10nKeys } from '$lib/utils/locales';
import { isSuperAdmin } from '$lib/utils/roles';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from 'sil.appbuilder.portal.common';
import { safeParse } from 'valibot';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  const user = (await event.locals.auth())!.user;
  const numberOfTasks = (
    await prisma.userTasks.findMany({
      where: {
        UserId: user.userId
      },
      select: {
        Id: true
      },
      distinct: 'ProductId'
    })
  ).length;
  const organizations = await prisma.organizations.findMany({
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
      Owner: {
        select: {
          Name: true
        }
      }
    }
  });

  const localDir =
    process.env.NODE_ENV === 'development'
      ? join(import.meta.dirname, '../../../static/languages')
      : '/app/build/client/languages';

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
    localizedNames: await Promise.all(
      locales.map(async (locale) => {
        const filePath = join(localDir, locale, 'ldml.json');

        let ret = null;
        if (existsSync(filePath)) {
          const file = (await readFile(filePath)).toString();
          ret = JSON.parse(file) as Entries<l10nKeys, Entries<string, string>>;
        }
        return [locale, ret] as [Locale, typeof ret];
      })
    ) as l10nEntries
  };
};
