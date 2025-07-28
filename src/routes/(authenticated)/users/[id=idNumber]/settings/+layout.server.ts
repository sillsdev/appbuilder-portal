import type { LayoutServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';
import { adminOrgs } from '$lib/users/server';
import { isSuperAdmin } from '$lib/utils/roles';

export const load = (async ({ params, locals }) => {
  const subject = await DatabaseReads.users.findUniqueOrThrow({
    where: {
      Id: parseInt(params.id!)
    },
    select: {
      Id: true,
      Name: true
    }
  });

  const user = (await locals.auth())!.user;

  // return only orgs containing the subject that the current user is also an admin for
  const filter = adminOrgs(subject.Id, user.userId, isSuperAdmin(user.roles));

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
