import { isAdminForOrgs, isSuperAdmin, orgsForRole } from '$lib/utils/roles';
import { idSchema } from '$lib/valibot';
import { error } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const toggleRoleSchema = v.object({
  orgId: idSchema,
  userId: idSchema,
  roleId: v.pipe(idSchema, v.enum(RoleId)),
  enabled: v.boolean()
});

export const load = (async ({ locals, params }) => {
  const user = (await locals.auth())!.user;
  const isSuper = isSuperAdmin(user.roles);
  const orgs = orgsForRole(RoleId.OrgAdmin, user.roles);
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
      UserRoles: {
        where: {
          UserId: subjectId
        },
        select: {
          RoleId: true
        }
      }
    }
  });

  // return 404 if user doesn't have any memberships/doesn't exist
  if (!rolesByOrg.length) return error(404);

  return {
    rolesMap: rolesByOrg.map((o) => [o.Id, o.UserRoles.map((r) => r.RoleId)]) as [
      number,
      RoleId[]
    ][]
  };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event, valibot(toggleRoleSchema));

    if (!form.valid) return fail(400, { form, ok: false });
    if (form.data.userId !== parseInt(event.params.id)) return fail(404, { form, ok: false });

    const user = (await event.locals.auth())!.user;
    const subjectOrgs = (
      await prisma.organizationMemberships.findMany({ where: { UserId: form.data.userId } })
    ).map((om) => om.UserId);

    if (!isAdminForOrgs(subjectOrgs, user.roles)) return fail(403, { form, ok: false });

    const ok = await DatabaseWrites.userRoles.toggleForOrg(
      form.data.orgId,
      form.data.userId,
      form.data.roleId,
      form.data.enabled
    );

    return { form, ok };
  }
} satisfies Actions;
