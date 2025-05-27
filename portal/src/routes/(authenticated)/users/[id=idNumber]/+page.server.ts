import { adminOrgs } from '$lib/users/server';
import { isSuperAdmin } from '$lib/utils/roles';
import { createHash } from 'node:crypto';
import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
  const user = (await locals.auth())!.user;
  const subjectId = parseInt(params.id);
  const preload = await prisma.users.findUniqueOrThrow({
    where: {
      Id: subjectId
    },
    select: {
      Name: true,
      Email: true,
      ProfileVisibility: true
    }
  });
  return {
    DisplayName: preload.Name,
    user:
      preload.ProfileVisibility || user.userId === subjectId
        ? await prisma.users.findUniqueOrThrow({
            where: {
              Id: subjectId
            },
            select: {
              Phone: true,
              Timezone: true,
              Email: true
            }
          })
        : undefined,
    gravatarHash: preload.Email ? createGravatarHash(preload.Email) : null,
    canEdit:
      user.userId == subjectId ||
      !!(await prisma.organizations.findFirst({
        where: adminOrgs(subjectId, user.userId, isSuperAdmin(user.roles)),
        select: { Id: true }
      }))
  };
}) satisfies PageServerLoad;

function createGravatarHash(email: string) {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}
