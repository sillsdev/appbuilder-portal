import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { idSchema } from '$lib/valibot';

const togglePublicSchema = v.object({
  publicByDefault: v.boolean()
});

const toggleProductSchema = v.object({
  prodDefId: idSchema,
  enabled: v.boolean()
});

export const load = (async (event) => {
  event.locals.security.requireAdminOfOrg(parseInt(event.params.id));
  const { organization } = await event.parent();
  return {
    allProductDefs: (
      await DatabaseReads.productDefinitions.findMany({
        include: { Organizations: { where: { Id: organization.Id }, select: { Id: true } } }
      })
    ).map((pd) => ({
      ...pd,
      enabled: !!pd.Organizations.length
    }))
  };
}) satisfies PageServerLoad;

export const actions = {
  async togglePublic(event) {
    event.locals.security.requireAdminOfOrg(parseInt(event.params.id));
    const form = await superValidate(event.request, valibot(togglePublicSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.organizations.update({
      where: {
        Id: parseInt(event.params.id)
      },
      data: {
        PublicByDefault: form.data.publicByDefault // seed for Project.IsPublic when creating a new project
      }
    });
    return { form, ok: true };
  },
  async toggleProduct(event) {
    event.locals.security.requireAdminOfOrg(parseInt(event.params.id));
    const form = await superValidate(event.request, valibot(toggleProductSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.organizationProductDefinitions.toggleForOrg(
      parseInt(event.params.id),
      form.data.prodDefId,
      form.data.enabled
    );

    return { form, ok: true };
  }
} satisfies Actions;
