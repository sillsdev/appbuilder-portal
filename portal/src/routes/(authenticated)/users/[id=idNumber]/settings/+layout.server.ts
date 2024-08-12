import { prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prismaTypes';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
  const user = await prisma.users.findUnique({
    where: {
      Id: parseInt(params.id ?? '')
    },
    include: {
      OrganizationMemberships: true
    }
  });
  const username = user?.Name;
  const roles = (await locals.auth())?.user.roles;
  const canEdit = !!roles?.find(
    (r) =>
      r[1] === RoleId.SuperAdmin ||
      (r[1] === RoleId.OrgAdmin &&
        user?.OrganizationMemberships.find((mem) => mem.OrganizationId === r[0]))
  );
  return { username, canEdit };
}) satisfies LayoutServerLoad;
