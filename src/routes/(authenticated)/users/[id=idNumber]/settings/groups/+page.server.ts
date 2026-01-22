import { error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { adminOrgs } from '$lib/users/server';
import { idSchema } from '$lib/valibot';

const toggleGroupSchema = v.object({
  orgId: idSchema,
  groupId: idSchema,
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

  return {
    groupsByOrg: await DatabaseReads.organizations.findMany({
      where: adminOrgs(subjectId, locals.security.userId, locals.security.isSuperAdmin),
      select: {
        Id: true,
        Groups: {
          select: {
            Id: true,
            Name: true,
            _count: {
              select: {
                Users: {
                  where: {
                    Id: subjectId
                  }
                }
              }
            }
          }
        }
      }
    })
  };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const subjectId = parseInt(event.params.id);
    const user = await DatabaseReads.users.findUnique({
      where: { Id: subjectId },
      include: { Organizations: { select: { Id: true } } }
    });
    if (!user) return error(404);
    event.locals.security.requireAdminOfOrgIn(user.Organizations.map((o) => o.Id));

    const form = await superValidate(event, valibot(toggleGroupSchema));

    if (!form.valid) return fail(400, { form, ok: false });

    // if user modified hidden values
    if (
      !(await DatabaseReads.organizations.findFirst({
        where: {
          AND: [
            adminOrgs(
              subjectId,
              event.locals.security.userId,
              event.locals.security.isSuperAdmin,
              form.data.orgId
            ),
            { Groups: { some: { Id: form.data.groupId } } }
          ]
        }
      }))
    ) {
      return error(403);
    }

    const ok = await DatabaseWrites.users.toggleGroup(
      subjectId,
      form.data.orgId,
      form.data.groupId,
      form.data.enabled
    );

    return { form, ok };
  }
} satisfies Actions;
