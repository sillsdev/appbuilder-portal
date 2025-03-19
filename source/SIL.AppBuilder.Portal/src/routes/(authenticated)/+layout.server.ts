import { i18n } from '$lib/i18n';
import { isSuperAdmin } from '$lib/utils/roles';
import { langtagsSchema } from '$lib/valibot';
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

  const availableLanguageTags = i18n.config.runtime.availableLanguageTags;

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
      availableLanguageTags.map(async (tag) => {
        const filePath = join(localDir, tag, 'ldml.json');

        let ret = null;
        if (existsSync(filePath)) {
          const file = (await readFile(filePath)).toString();
          const parsed = JSON.parse(file) as {
            localeDisplayNames: {
              languages: Record<string, string>;
            };
          };

          ret = Object.entries(parsed.localeDisplayNames.languages);
        }
        return [tag, ret] as [typeof tag, typeof ret];
      })
    )
  };
};
