import { createHash } from 'node:crypto';
import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  const userId = parseInt(params.id);
  const preload = await prisma.users.findUniqueOrThrow({
    where: {
      Id: userId
    },
    select: {
      Name: true,
      Email: true,
      ProfileVisibility: true
    }
  });
  return {
    DisplayName: preload.Name,
    user: preload.ProfileVisibility
      ? await prisma.users.findUniqueOrThrow({
          where: {
            Id: userId
          },
          select: {
            Phone: true,
            Timezone: true,
            Email: true
          }
        })
      : undefined,
    gravatarHash: preload.Email ? createGravatarHash(preload.Email) : null
  };
}) satisfies PageServerLoad;

function createGravatarHash(email: string) {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}
