import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';
import { adminOrgs } from '$lib/users/server';

export const load = (async ({ params, locals }) => {
  locals.security.requireAuthenticated();
  if (!locals.security.isSuperAdmin && locals.security.userId !== parseInt(params.id!)) {
    throw error(403);
  }
  const subject = await DatabaseReads.users.findUniqueOrThrow({
    where: {
      Id: parseInt(params.id!)
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
