import type { Prisma } from '@prisma/client';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';

/**
 * 
 * @param subjectId 
 * @param userId 
 * @param isSuper 
 * @param orgId Included if you want to check for a specific org
 * @returns A filter for orgs that the subject user is in and the current user is an admin for
 */
export function adminOrgs(subjectId: number, userId: number, isSuper: boolean, orgId?: number) {
  return {
    Id: orgId,
    OrganizationMemberships: {
      some: {
        UserId: subjectId
      }
    },
    UserRoles: isSuper
      ? undefined
      : {
          some: {
            UserId: userId,
            RoleId: RoleId.OrgAdmin
          }
        }
  } as Prisma.OrganizationsWhereInput;
}
