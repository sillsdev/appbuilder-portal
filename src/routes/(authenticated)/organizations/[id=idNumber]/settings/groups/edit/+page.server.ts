import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { deleteSchema, idSchema, requiredString } from '$lib/valibot';

const editSchema = v.object({
  id: idSchema,
  name: requiredString,
  description: v.nullable(v.string())
});
export const load = (async (event) => {
  const orgId = parseInt(event.params.id);
  const groupId = parseInt(event.url.searchParams.get('id') ?? '');
  event.locals.security.requireAdminOfOrg(orgId);
  if (isNaN(groupId)) {
    return redirect(302, localizeHref(`/organizations/${event.params.id}/settings/groups`));
  }

  const group = await DatabaseReads.groups.findUnique({
    where: {
      Id: groupId,
      OwnerId: orgId
    },
    select: {
      Id: true,
      Name: true,
      Description: true,
      _count: {
        select: {
          Users: true,
          Projects: true
        }
      }
    }
  });

  if (!group) return error(404);

  return {
    group,
    users: await DatabaseReads.users.findMany({
      where: {
        Organizations: {
          some: {
            Id: orgId
          }
        }
      },
      select: {
        Id: true,
        Name: true,
        Email: true,
        _count: {
          select: {
            Projects: { where: { GroupId: groupId } },
            Groups: { where: { Id: groupId } }
          }
        }
      }
    }),
    form: await superValidate(
      { id: groupId, name: group.Name, description: group.Description },
      valibot(editSchema)
    ),
    deleteForm: await superValidate({ id: groupId }, valibot(deleteSchema))
  };
}) satisfies PageServerLoad;

export const actions = {
  async edit(event) {
    const orgId = parseInt(event.params.id);
    event.locals.security.requireAdminOfOrg(orgId);

    const form = await superValidate(event.request, valibot(editSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    if (
      !(await DatabaseReads.groups.findFirst({
        where: { Id: form.data.id, OwnerId: orgId }
      }))
    ) {
      return fail(403, { form, ok: false });
    }

    await DatabaseWrites.groups.update(form.data.id, {
      Name: form.data.name,
      Description: form.data.description
    });

    return { form, ok: true };
  },
  async toggleUser(event) {
    const orgId = parseInt(event.params.id);
    event.locals.security.requireAdminOfOrg(orgId);

    const form = await superValidate(
      event,
      valibot(v.object({ groupId: idSchema, userId: idSchema, enabled: v.boolean() }))
    );

    if (!form.valid) return fail(400, { form, ok: false });

    const ok = await DatabaseWrites.users.toggleGroup(
      form.data.userId,
      orgId,
      form.data.groupId,
      form.data.enabled
    );

    return { form, ok };
  },
  async deleteGroup(event) {
    const orgId = parseInt(event.params.id);
    event.locals.security.requireAdminOfOrg(orgId);
    const form = await superValidate(event.request, valibot(deleteSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    if (
      !(await DatabaseReads.groups.findFirst({
        where: { Id: form.data.id, OwnerId: orgId }
      }))
    ) {
      return fail(403, { form, ok: false });
    }

    return {
      form,
      ok: await DatabaseWrites.groups.deleteGroup(form.data.id)
    };
  }
} satisfies Actions;
