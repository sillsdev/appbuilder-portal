import { isAdminForOrgs } from '$lib/utils/roles';
import { error } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import type { LayoutServerLoad } from './$types';

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

  const subjectOrgs = await prisma.organizations.findMany({
    where: {
      OrganizationMemberships: {
        some: {
          UserId: subject.Id
        }
      }
    },
    select: {
      Id: true,
      Name: true
    }
  });

  return {
    subject,
    subjectOrgs,
    canEdit: isAdminForOrgs(
      subjectOrgs.map((o) => o.Id),
      (await locals.auth())?.user.roles
    )
  };
}) satisfies LayoutServerLoad;
