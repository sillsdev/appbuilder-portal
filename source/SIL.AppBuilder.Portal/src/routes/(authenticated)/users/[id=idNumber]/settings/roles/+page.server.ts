import { idSchema } from '$lib/valibot';
import { error } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const rolesSchema = v.object({
  organizations: v.array(
    v.object({
      name: v.string(),
      id: idSchema,
      roles: v.array(idSchema)
      // enabled: v.boolean()
    })
  )
});

export const load = (async ({ locals, params }) => {
  const auth = (await locals.auth())?.user.roles;
  const isSuperAdmin = auth?.find((r) => r[1] === RoleId.SuperAdmin);
  const orgAdmins = auth?.filter((r) => r[1] === RoleId.OrgAdmin).map((r) => r[0]);
  const userRoles = (
    await prisma.users.findUnique({
      where: {
        Id: parseInt(params.id)
      },
      include: {
        UserRoles: {
          include: {
            Organization: true
          }
        }
      }
    })
  )?.UserRoles;
  if (!userRoles) return error(404);
  const mapping = new Map<number, [string, number[]]>();
  for (const role of userRoles) {
    if (!mapping.has(role.OrganizationId)) {
      if (isSuperAdmin || orgAdmins?.includes(role.OrganizationId))
        mapping.set(role.OrganizationId, [role.Organization.Name!, [role.RoleId]]);
    } else {
      mapping.get(role.OrganizationId)![1].push(role.RoleId);
    }
  }
  if (mapping.size === 0) {
    return error(403);
  }
  const form = await superValidate(
    {
      organizations: [...mapping.entries()].map(([key, value]) => ({
        name: value[0],
        id: key,
        roles: value[1]
      }))
    },
    valibot(rolesSchema)
  );
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event, valibot(rolesSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const userId = (await event.locals.auth())!.user.userId;
    const adminRoles = await prisma.userRoles.findMany({
      where: {
        UserId: userId,
        RoleId: {
          in: [RoleId.OrgAdmin, RoleId.SuperAdmin]
        }
      }
    });
    const superAdmin = adminRoles.find((r) => r.RoleId === RoleId.SuperAdmin);

    // Filter for legal orgs to modify, then map to relevant table entries
    const newRelationEntries = form.data.organizations.filter(
      (org) => superAdmin || adminRoles.find((r) => r.OrganizationId === org.id)
    );
    const subjectUserId = parseInt(event.params.id);
    for (const org of newRelationEntries) {
      await DatabaseWrites.userRoles.setUserRolesForOrganization(subjectUserId, org.id, org.roles);
    }
    return { form, ok: true };
  }
} satisfies Actions;
