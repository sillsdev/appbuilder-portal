import { trace } from '@opentelemetry/api';
import { api } from '@opentelemetry/sdk-node';
import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { RoleId } from '$lib/prisma';
import { BullMQ, QueueConnected, getQueues } from '$lib/server/bullmq';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { isAdmin, isAdminForOrg, isSuperAdmin } from '$lib/utils/roles';
import { idSchema } from '$lib/valibot';

const createSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  organizationId: idSchema,
  roles: v.array(idSchema),
  groups: v.array(idSchema)
});

export const load = (async ({ locals }) => {
  const form = await superValidate(valibot(createSchema));

  const user = await locals.auth();
  if (!isAdmin(user?.user.roles)) return error(403);
  const groupsByOrg = await DatabaseReads.organizations.findMany({
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
  return { form, groupsByOrg, jobsAvailable: QueueConnected() };
}) satisfies PageServerLoad;

export const actions = {
  async new({ request, locals, url }) {
    const form = await superValidate(request, valibot(createSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    if (!QueueConnected()) return error(503);

    const user = (await locals.auth())!.user;
    // if user modified hidden values
    if (!isAdminForOrg(form.data.organizationId, user.roles)) return fail(403);
    const { email, organizationId, roles, groups } = form.data;
    const inviteToken = await DatabaseWrites.organizationMemberships.createOrganizationInvite(
      email,
      organizationId,
      user.userId,
      roles,
      groups
    );
    const inviteLink = `${url.origin}/invitations/organization-membership?t=${inviteToken}`;
    await getQueues().Emails.add('Invite User ' + email, {
      type: BullMQ.JobType.Email_InviteUser,
      OTContext: trace.getSpanContext(api.context.active()),
      email,
      inviteToken,
      inviteLink
    });
    return { ok: true, form };
  }
} satisfies Actions;
