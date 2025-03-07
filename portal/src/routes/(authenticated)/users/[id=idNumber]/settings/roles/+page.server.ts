import { isAdminForOrg, isSuperAdmin, orgsForRole } from '$lib/utils';
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
      name: v.nullable(v.string()),
      id: idSchema,
      roles: v.array(idSchema)
      // enabled: v.boolean()
    })
  )
});

export const load = (async ({ locals, params }) => {
  const auth = (await locals.auth())?.user.roles;
  const isSuper = isSuperAdmin(auth);
  const orgs = orgsForRole(RoleId.OrgAdmin, auth);
  if (!(isSuper || orgs?.length)) return error(403);
  const subjectId = parseInt(params.id);

  const rolesByOrg = await prisma.organizations.findMany({
    where: {
      OrganizationMemberships: {
        some: {
          UserId: subjectId
        }
      },
      Id: isSuper ? undefined : { in: orgs }
    },
    select: {
      Id: true,
      Name: true,
      UserRoles: {
        where: {
          UserId: subjectId
        }
      }
    }
  });

  // return 404 if user doesn't have any memberships/doesn't exist
  if (!rolesByOrg.length) return error(404);

  const form = await superValidate(
    {
      organizations: rolesByOrg.map((o) => ({
        id: o.Id,
        name: o.Name,
        roles: o.UserRoles.map((ur) => ur.RoleId)
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

    const user = (await event.locals.auth())!.user;

    // Filter for legal orgs to modify, then map to relevant table entries
    const newRelationEntries = form.data.organizations.filter((org) =>
      isAdminForOrg(org.id, user.roles)
    );
    const subjectUserId = parseInt(event.params.id);
    for (const org of newRelationEntries) {
      await DatabaseWrites.userRoles.setUserRolesForOrganization(subjectUserId, org.id, org.roles);
    }
    return { form, ok: true };
  }
} satisfies Actions;
