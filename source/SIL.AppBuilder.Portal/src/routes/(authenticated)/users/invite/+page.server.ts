import { idSchema } from '$lib/valibot';
import { fail } from '@sveltejs/kit';
import { DatabaseWrites } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const createSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  organizationId: idSchema
  // TODO: add roles + groups
});

export const load = (async ({ url }) => {
  const form = await superValidate(valibot(createSchema));
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  async new({ request, locals, url }) {
    const form = await superValidate(request, valibot(createSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false, errors: form.errors });
    }
    const user = await locals.auth();
    if (
      !user ||
      !user.user.roles.find(
        (r) =>
          r[1] === RoleId.SuperAdmin ||
          (r[0] === form.data.organizationId && r[1] === RoleId.OrgAdmin)
      )
    )
      return fail(401);
    try {
      const { email, organizationId } = form.data;
      const inviteToken = await DatabaseWrites.organizationMemberships.createOrganizationInvite(
        email,
        organizationId,
        user.user.userId
      );
      const inviteLink = `${url.origin}/invitations/organization-membership?t=${inviteToken}`;
      // TODO: send email
      console.log(inviteLink, email);
      return { ok: true, form };
    } catch (e) {
      if (e instanceof v.ValiError) return { form, ok: false, errors: e.issues };
      throw e;
    }
  }
} satisfies Actions;
