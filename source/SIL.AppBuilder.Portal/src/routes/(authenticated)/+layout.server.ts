import { isSuperAdmin } from '$lib/utils/roles';
import { langtagsSchema } from '$lib/valibot';
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

  const path =
    process.env.NODE_ENV === 'development'
      ? join(import.meta.dirname, '../../../static/langtags.json')
      : '/app/build/client/langtags.json';

  return {
    organizations,
    numberOfTasks,
    // streaming promise
    langtags: await readFile(path)
      .then((j) => {
        const res = safeParse(langtagsSchema, JSON.parse(j.toString()));
        return res.success ? res.output : [];
      })
      .catch((r) => {
        console.log(r);
        return [];
      })
  };
};
