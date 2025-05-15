import { isAdminForOrg, isSuperAdmin } from '$lib/utils/roles';
import { idSchema } from '$lib/valibot';
import { fail } from '@sveltejs/kit';
import { BullMQ, DatabaseWrites, prisma, Queues } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const createSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  organizationId: idSchema,
  roles: v.array(idSchema),
  groups: v.array(idSchema)
});

export const load = (async ({ locals }) => {
  const form = await superValidate(valibot(createSchema));

  const user = await locals.auth();
  const groupsByOrg = await prisma.organizations.findMany({
    where: {
      // Only send a list of groups for orgs that the current user has access to
      UserRoles: isSuperAdmin(user?.user.roles)
        ? undefined
        : {
          some: {
            UserId: user?.user.userId,
            RoleId: RoleId.OrgAdmin
          }
        }
    },
    select: {
      Id: true,
      Name: true,
      Groups: true
    }
  });
  return { form, groupsByOrg };
}) satisfies PageServerLoad;

export const actions = {
  async new({ request, locals, url }) {
    const form = await superValidate(request, valibot(createSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }
    const user = await locals.auth();
    if (!user || !isAdminForOrg(form.data.organizationId, user.user.roles)) return fail(401);
    try {
      const { email, organizationId, roles, groups } = form.data;
      const inviteToken = await DatabaseWrites.organizationMemberships.createOrganizationInvite(
        email,
        organizationId,
        user.user.userId,
        roles,
        groups
      );
      const inviteLink = `${url.origin}/invitations/organization-membership?t=${inviteToken}`;
      Queues.EmailTasks.add('Invite User ' + email, {
        type: BullMQ.JobType.Email_InviteUser,
        email,
        inviteToken,
        inviteLink
      });
      return { ok: true, form };
    } catch (e) {
      if (e instanceof v.ValiError) return { form, ok: false, errors: e.issues };
      throw e;
    }
  }
} satisfies Actions;
