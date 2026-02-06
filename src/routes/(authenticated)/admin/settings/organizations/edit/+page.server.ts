import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { organizationBaseSchema } from '$lib/organizations';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { idSchema } from '$lib/valibot';

const editSchema = v.object({
  id: idSchema,
  ...organizationBaseSchema.entries
});
export const load = (async ({ url, locals }) => {
  locals.security.requireSuperAdmin();
  const id = parseInt(url.searchParams.get('id') ?? '');
  if (isNaN(id)) {
    return redirect(302, localizeHref('/admin/settings/organizations'));
  }

  const showUsers = env.APP_ENV === 'dev';
  const data = await DatabaseReads.organizations.findUnique({
    where: {
      Id: id
    },
    include: {
      _count: {
        select: {
          Users: { where: { IsLocked: false } }
        }
      }
    }
  });
  if (!data) return redirect(302, localizeHref('/admin/settings/organizations'));

  return {
    form: await superValidate(
      {
        id: data.Id,
        name: data.Name,
        contact: data.ContactEmail,
        websiteUrl: data.WebsiteUrl,
        buildEngineUrl: data.BuildEngineUrl,
        buildEngineApiAccessToken: data.BuildEngineApiAccessToken,
        logoUrl: data.LogoUrl,
        useDefaultBuildEngine: data.UseDefaultBuildEngine,
        publicByDefault: data.PublicByDefault ?? false
      },
      valibot(editSchema)
    ),
    showUsers,
    userCount: showUsers ? data._count.Users : 0,
    users: showUsers
      ? await DatabaseReads.users.findMany({
          where: { IsLocked: false },
          select: {
            Id: true,
            Name: true,
            Email: true,
            _count: {
              select: {
                Projects: { where: { OrganizationId: id } },
                Organizations: { where: { Id: id } }
              }
            }
          }
        })
      : []
  };
}) satisfies PageServerLoad;

export const actions = {
  async edit({ request, locals }) {
    locals.security.requireSuperAdmin();
    const form = await superValidate(request, valibot(editSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }
    await DatabaseWrites.organizations.update(form.data.id, {
      Name: form.data.name,
      BuildEngineApiAccessToken: form.data.buildEngineApiAccessToken,
      BuildEngineUrl: form.data.buildEngineUrl,
      LogoUrl: form.data.logoUrl,
      ContactEmail: form.data.contact,
      PublicByDefault: form.data.publicByDefault,
      UseDefaultBuildEngine: form.data.useDefaultBuildEngine,
      WebsiteUrl: form.data.websiteUrl
    });

    return { ok: true, form };
  },
  async toggleUser(event) {
    event.locals.security.requireSuperAdmin();

    const form = await superValidate(
      event,
      valibot(v.object({ orgId: idSchema, userId: idSchema, enabled: v.boolean() }))
    );

    if (!form.valid) return fail(400, { form, ok: false });
    if (env.APP_ENV === 'dev') {
      const ok = await DatabaseWrites.organizations.toggleUser(
        form.data.orgId,
        form.data.userId,
        form.data.enabled
      );

      return { form, ok };
    } else {
      return fail(403, { form, ok: false });
    }
  }
} satisfies Actions;
