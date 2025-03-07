import { isAdminForOrgs } from '$lib/utils';
import { prisma } from 'sil.appbuilder.portal.common';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
  const subject = await prisma.users.findUnique({
    where: {
      Id: parseInt(params.id ?? '')
    },
    include: {
      OrganizationMemberships: true
    }
  });
  const username = subject?.Name;
  const roles = (await locals.auth())?.user.roles;
  const canEdit = isAdminForOrgs(
    subject?.OrganizationMemberships.map((mem) => mem.OrganizationId) ?? [],
    roles
  );
  return { username, canEdit };
}) satisfies LayoutServerLoad;
