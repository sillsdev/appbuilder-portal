import { isSuperAdmin } from '$lib/utils/roles';
import { langtagsSchema } from '$lib/valibot';
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

  return {
    organizations,
    numberOfTasks,
    // streaming promise
    langtags: await event
      .fetch('/langtags.json')
      .then((r) => r.text())
      .then((j) => {
        const langtags = safeParse(langtagsSchema, JSON.parse(j));
        if (langtags.success) {
          return langtags.output;
        } else {
          return [];
        }
      })
  };
};
