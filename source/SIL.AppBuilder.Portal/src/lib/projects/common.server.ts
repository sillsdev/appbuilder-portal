import type { Session } from '@auth/sveltekit';
import { prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import * as v from 'valibot';
import { idSchema } from '$lib/valibot';

export async function verifyCanViewAndEdit(user: Session, projectId: number) {
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

export async function verifyCanCreateProject(user: Session, orgId: number) {
  // Creating a project is allowed if the user is an OrgAdmin or AppBuilder for the organization or a SuperAdmin
  const roles = user.user.roles
    .filter(([org, role]) => org === orgId || role === RoleId.SuperAdmin)
    .map(([org, role]) => role);
  return (
    roles.includes(RoleId.AppBuilder) ||
    roles.includes(RoleId.OrgAdmin) ||
    roles.includes(RoleId.SuperAdmin)
  );
}

const projectSchemaBase = v.object({
  Name: v.pipe(v.string(), v.minLength(1)),
  Description: v.optional(v.string()),
  Language:  v.pipe(v.string(), v.minLength(1)),
  IsPublic: v.boolean(),
})

export const projectCreateSchema = v.object({
  ...projectSchemaBase.entries,
  group: idSchema,
  type: idSchema,
});

export const importJSONSchema = v.object({
  Projects: v.pipe(v.array(v.object({
    ...projectSchemaBase.entries,
    AllowDownloads: v.optional(v.boolean()),
    AutomaticBuilds: v.optional(v.boolean())
  })), v.minLength(1)),
  Products: v.pipe(v.array(v.object({
    Name: v.string(),
    Store: v.string()
  })), v.minLength(1))
})
