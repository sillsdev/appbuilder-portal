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
  locals.security.requireAdminOfOrgIn(
    (await DatabaseReads.users
      .findUnique({
        where: { Id: subjectId },
        select: { OrganizationMemberships: { select: { OrganizationId: true } } }
      })
      .then((u) => u?.OrganizationMemberships.map((o) => o.OrganizationId))) ?? []
  );

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
                GroupMemberships: {
                  where: {
                    UserId: subjectId
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
    // ISSUE: #1102 composite keys? I really want to change all many-to-many relationships in db to have composite primary keys
    // In this case that would be GroupMemberships PRIMARY KEY(GroupId, UserId)
    // This way they can be added and removed in constant time and in a single command
    // https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations

    const subjectId = parseInt(event.params.id);
    event.locals.security.requireAdminOfOrgIn(
      (await DatabaseReads.users
        .findUnique({
          where: { Id: subjectId },
          select: { OrganizationMemberships: { select: { OrganizationId: true } } }
        })
        .then((u) => u?.OrganizationMemberships.map((o) => o.OrganizationId))) ?? []
    );

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

    const ok = await DatabaseWrites.groupMemberships.toggleForOrg(
      form.data.orgId,
      subjectId,
      form.data.groupId,
      form.data.enabled
    );

    return { form, ok };
  }
} satisfies Actions;
