import { error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { RoleId } from '$lib/prisma';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { getSiteParam } from '$lib/site-params/server';
import { adminOrgs } from '$lib/users/server';
import { idSchema } from '$lib/valibot';

const toggleRoleSchema = v.object({
  orgId: idSchema,
  userId: idSchema,
  roleId: v.pipe(idSchema, v.enum(RoleId)),
  enabled: v.boolean()
});

export const load = (async ({ params, locals }) => {
  const subjectId = parseInt(params.id);
  const user = await DatabaseReads.users.findUnique({
    where: { Id: subjectId },
    include: { Organizations: { select: { Id: true } } }
  });
  if (!user) return error(404);
  locals.security.requireAdminOfOrgIn(user.Organizations.map((o) => o.Id));
  const supportAgentOrgAllowList = await getSiteParam('users', 'org-show-support-agent');

  return {
    supportAgentOrgAllowList,
    rolesByOrg: await DatabaseReads.organizations.findMany({
      where: adminOrgs(subjectId, locals.security.userId, locals.security.isSuperAdmin),
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
    const user = await DatabaseReads.users.findUnique({
      where: { Id: parseInt(event.params.id) },
      include: { Organizations: { select: { Id: true } } }
    });
    if (!user) return error(404);
    event.locals.security.requireAdminOfOrgIn(user.Organizations.map((o) => o.Id));

    const form = await superValidate(event, valibot(toggleRoleSchema));

    if (!form.valid) return fail(400, { form, ok: false });
    event.locals.security.requireAdminOfOrg(form.data.orgId);

    const supportAgentOrgAllowList = await getSiteParam('users', 'org-show-support-agent');
    if (
      form.data.roleId === RoleId.SupportAgent &&
      form.data.enabled &&
      supportAgentOrgAllowList !== 'all' &&
      !supportAgentOrgAllowList.includes(form.data.orgId)
    ) {
      return error(403);
    }

    // if user modified hidden values
    if (
      !(
        form.data.userId === parseInt(event.params.id) ||
        (await DatabaseReads.organizations.findFirst({
          where: adminOrgs(
            form.data.userId,
            event.locals.security.userId,
            event.locals.security.isSuperAdmin,
            form.data.orgId
          )
        }))
      )
    ) {
      return error(403);
    }

    const ok = await DatabaseWrites.users.toggleRole(
      form.data.userId,
      form.data.orgId,
      form.data.roleId,
      form.data.enabled
    );

    return { form, ok };
  }
} satisfies Actions;
