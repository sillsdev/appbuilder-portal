import { isAdminForOrgs, isSuperAdmin } from '$lib/utils/roles';
import { idSchema } from '$lib/valibot';
import { error } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const toggleGroupSchema = v.object({
  orgId: idSchema,
  userId: idSchema,
  groupId: idSchema,
  enabled: v.boolean()
});

export const load = (async ({ params, locals }) => {
  const userData = (await locals.auth())?.user;
  const userId = userData?.userId;
  const isSuper = isSuperAdmin(userData?.roles);
  const subjectUserId = parseInt(params.id);

  const groupsByOrg = await prisma.organizations.findMany({
    where: {
      // Only send a list of groups for orgs that the subject user is in and the current user has access to
      UserRoles: isSuper
        ? undefined
        : {
            some: {
              UserId: userId,
              RoleId: RoleId.OrgAdmin
            }
          },
      OrganizationMemberships: {
        some: {
          UserId: subjectUserId
        }
      }
    },
    select: {
      Id: true,
      Groups: {
        select: {
          Id: true,
          Name: true
        }
      }
    }
  });

  const groupMemberships = new Set(
    (
      await prisma.groupMemberships.findMany({
        where: {
          UserId: subjectUserId
        },
        select: {
          GroupId: true
        }
      })
    ).map((g) => g.GroupId)
  );
  // If there are no groups the current user has admin access to return Forbidden
  if (!groupsByOrg.length) return error(403);
  return {
    groupsByOrg: groupsByOrg.map((o) => [
      o.Id,
      o.Groups.map((g) => ({ ...g, enabled: groupMemberships.has(g.Id) }))
    ]) as [number, ((typeof groupsByOrg)[number]['Groups'][number] & { enabled: boolean })[]][]
  };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    // TODO: test this action
    // TODO: I really want to change all many-to-many relationships in db to have composite primary keys
    // In this case that would be GroupMemberships PRIMARY KEY(GroupId, UserId)
    // This way they can be added and removed in constant time and in a single command
    // https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations

    const form = await superValidate(event, valibot(toggleGroupSchema));

    if (!form.valid) return fail(400, { form, ok: false });
    if (form.data.userId !== parseInt(event.params.id)) return fail(404, { form, ok: false });

    const user = (await event.locals.auth())!.user;
    const subjectOrgs = (
      await prisma.organizationMemberships.findMany({ where: { UserId: form.data.userId } })
    ).map((om) => om.UserId);

    if (!isAdminForOrgs(subjectOrgs, user.roles)) return fail(403, { form, ok: false });

    const ok = await DatabaseWrites.groupMemberships.toggleForOrg(
      form.data.orgId,
      form.data.userId,
      form.data.groupId,
      form.data.enabled
    );

    return { form, ok };
  }
} satisfies Actions;
