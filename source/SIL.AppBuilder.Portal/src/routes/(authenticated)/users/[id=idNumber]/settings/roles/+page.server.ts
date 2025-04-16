import { isSuperAdmin } from '$lib/utils/roles';
import { idSchema } from '$lib/valibot';
import { error } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import { where } from '../common.server';
import type { Actions, PageServerLoad } from './$types';

const toggleRoleSchema = v.object({
  orgId: idSchema,
  userId: idSchema,
  roleId: v.pipe(idSchema, v.enum(RoleId)),
  enabled: v.boolean()
});

export const load = (async ({ params, locals }) => {
  const subjectId = parseInt(params.id);
  const user = (await locals.auth())!.user;

  return {
    rolesByOrg: await prisma.organizations.findMany({
      where: where(subjectId, user.userId, isSuperAdmin(user.roles)),
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
    })
  };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event, valibot(toggleRoleSchema));

    if (!form.valid) return fail(400, { form, ok: false });
    if (form.data.userId !== parseInt(event.params.id)) return error(404);

    const user = (await event.locals.auth())!.user;

    if (
      !(await prisma.organizations.findFirst({
        where: where(form.data.userId, user.userId, isSuperAdmin(user.roles), form.data.orgId)
      }))
    ) {
      return error(403);
    }

    const ok = await DatabaseWrites.userRoles.toggleForOrg(
      form.data.orgId,
      form.data.userId,
      form.data.roleId,
      form.data.enabled
    );

    return { form, ok };
  }
} satisfies Actions;
