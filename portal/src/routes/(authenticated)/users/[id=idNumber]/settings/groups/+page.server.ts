import { isSuperAdmin } from '$lib/utils/roles';
import { idSchema } from '$lib/valibot';
import { error } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import { where } from '../common.server';
import type { Actions, PageServerLoad } from './$types';

const toggleGroupSchema = v.object({
  orgId: idSchema,
  groupId: idSchema,
  enabled: v.boolean()
});

export const load = (async ({ params, locals }) => {
  const subjectId = parseInt(params.id);
  const user = (await locals.auth())!.user;

  return {
    groupsByOrg: await prisma.organizations.findMany({
      where: where(subjectId, user.userId, isSuperAdmin(user.roles)),
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

    const form = await superValidate(event, valibot(toggleGroupSchema));

    if (!form.valid) return fail(400, { form, ok: false });

    const user = (await event.locals.auth())!.user;
    const subjectId = parseInt(event.params.id);
    // if user modified hidden values
    if (
      !(await prisma.organizations.findFirst({
        where: {
          AND: [
            where(subjectId, user.userId, isSuperAdmin(user.roles), form.data.orgId),
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
