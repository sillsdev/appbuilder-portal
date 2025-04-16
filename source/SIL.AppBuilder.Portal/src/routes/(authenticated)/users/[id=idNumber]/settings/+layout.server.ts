import { isSuperAdmin } from '$lib/utils/roles';
import { error } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import type { LayoutServerLoad } from './$types';
import { where } from './common.server';

export const load = (async ({ params, locals }) => {
  const subject = await prisma.users.findUnique({
    where: {
      Id: parseInt(params.id ?? '')
    },
    select: {
      Id: true,
      Name: true
    }
  });
  if (!subject) return error(404);

  const user = (await locals.auth())!.user;

  // return only orgs containing the subject that the current user is also an admin for
  const filter = where(subject.Id, user.userId, isSuperAdmin(user.roles));

  return {
    subject,
    canEdit: !!(await prisma.organizations.findFirst({ where: filter })),
    subjectOrgs: await prisma.organizations.findMany({
      where: filter,
      select: { Id: true, Name: true }
    }),
  };
}) satisfies LayoutServerLoad;
