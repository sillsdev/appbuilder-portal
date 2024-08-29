import type { Session } from '@auth/sveltekit';
import { prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';

export async function verifyCanView(user: Session, projectId: number) {
  // Editing is allowed if the user owns the project, or if the user is an organization
  // admin for the project's organization, or if the user is a super admin
  const orgId = await prisma.projects.findUnique({
    where: {
      Id: projectId
    }
  });
  if (orgId?.OwnerId === user.user.userId) return true;
  if (
    user.user.roles.find(
      (r) =>
        r[1] === RoleId.SuperAdmin || (r[1] === RoleId.OrgAdmin && r[0] === orgId?.OrganizationId)
    )
  )
    return true;
  return false;
}
