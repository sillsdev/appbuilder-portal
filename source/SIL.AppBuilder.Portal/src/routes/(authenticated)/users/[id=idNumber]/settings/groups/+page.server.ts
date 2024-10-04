import { idSchema } from '$lib/valibot';
import { error } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const groupsSchema = v.object({
  organizations: v.array(
    v.object({
      name: v.string(),
      id: idSchema,
      groups: v.array(idSchema)
      // enabled: v.boolean()
    })
  )
});

export const load = (async ({ params, locals }) => {
  const userData = (await locals.auth())?.user;
  const userId = userData?.userId;
  const isSuperAdmin = !!userData?.roles.find((r) => r[1] === RoleId.SuperAdmin);
  const subjectUserId = parseInt(params.id);

  const accessibleGroups = await prisma.groups.findMany({
    where: {
      Owner: {
        // Only send a list of groups for orgs that the subject user is in and the current user has access to
        AND: isSuperAdmin
          ? undefined
          : {
            UserRoles: {
              some: {
                UserId: userId,
                RoleId: RoleId.OrgAdmin
              }
            }
          },
        OrganizationMemberships: {
          some: {
            UserId: subjectUserId
          }
        }
      }
    },
    include: {
      Owner: true
    }
  });
  const groupMemberships = await prisma.groupMemberships.findMany({
    where: {
      UserId: subjectUserId
    },
    include: {
      Group: true
    }
  });
  // If there are no groups the current user has admin access to return Forbidden
  if (accessibleGroups.length === 0) return error(403);
  const organizationToGroupMapping = new Map<number, [string, number[]]>();
  for (const org of [...new Map(accessibleGroups.map((g) => [g.OwnerId, g.Owner.Name!]))]) {
    organizationToGroupMapping.set(org[0], [org[1], []]);
  }
  for (const group of groupMemberships) {
    if (organizationToGroupMapping.has(group.Group.OwnerId))
      organizationToGroupMapping.get(group.Group.OwnerId)![1].push(group.GroupId);
  }
  const form = await superValidate(
    {
      organizations: [...organizationToGroupMapping.entries()].map(([key, value]) => ({
        name: value[0],
        id: key,
        groups: value[1]
      }))
    },
    valibot(groupsSchema)
  );
  return {
    form,
    groups: accessibleGroups.map((uG) => ({ id: uG.Id, name: uG.Name, orgId: uG.OwnerId }))
  };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    // TODO: test this action
    // TODO: I really want to change all many-to-many relationships in db to have composite primary keys
    // In this case that would be GroupMemberships PRIMARY KEY(GroupId, UserId)
    // This way they can be added and removed in constant time and in a single command
    // https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations

    const form = await superValidate(event, valibot(groupsSchema));
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
    const newRelationEntries = form.data.organizations
      .filter((org) => superAdmin || adminRoles.find((r) => r.OrganizationId === org.id))
      .flatMap((org) => org.groups.map((group) => group));
    const uId = parseInt(event.params.id);
    const success = await DatabaseWrites.groupMemberships.updateUserGroups(uId, newRelationEntries);
    return { form, ok: success };
  }
} satisfies Actions;
