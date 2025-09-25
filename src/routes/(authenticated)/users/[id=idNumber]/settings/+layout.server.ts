import type { LayoutServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';
import { adminOrgs } from '$lib/users/server';

export const load = (async ({ params, locals }) => {
  locals.security.requireAuthenticated();
  const userId = Number(params.id);
  if (isNaN(userId)) return error(404);
  if (locals.security.userId !== userId) {
    locals.security.requireAdminOfOrgIn(
      await DatabaseReads.organizationMemberships
        .findMany({
          where: { UserId: userId },
          select: { OrganizationId: true }
        })
        .then((orgs) => orgs.map((o) => o.OrganizationId))
    );
  }
  const subject = await DatabaseReads.users.findUniqueOrThrow({
    where: {
      Id: userId
    },
    select: {
      Id: true,
      Name: true
    }
  });

  // return only orgs containing the subject that the current user is also an admin for
  const filter = adminOrgs(subject.Id, locals.security.userId, locals.security.isSuperAdmin);

  const canEdit = !!(await DatabaseReads.organizations.findFirst({ where: filter }));

  return {
    subject,
    canEdit,
    subjectOrgs: canEdit
      ? await DatabaseReads.organizations.findMany({
          where: filter,
          select: { Id: true, Name: true }
        })
      : []
  };
}) satisfies LayoutServerLoad;
