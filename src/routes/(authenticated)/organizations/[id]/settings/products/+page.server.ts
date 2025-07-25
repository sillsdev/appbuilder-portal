import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { idSchema } from '$lib/valibot';

const togglePublicSchema = v.object({
  publicByDefault: v.boolean()
});

const toggleProductSchema = v.object({
  prodDefId: idSchema,
  enabled: v.boolean()
});

export const load = (async (event) => {
  const { organization } = await event.parent();
  const setOrgProductDefs = new Set(
    (
      await prisma.organizationProductDefinitions.findMany({
        where: {
          OrganizationId: organization.Id
        }
      })
    ).map((p) => p.ProductDefinitionId)
  );
  return {
    allProductDefs: (await prisma.productDefinitions.findMany()).map((pd) => ({
      ...pd,
      enabled: setOrgProductDefs.has(pd.Id)
    }))
  };
}) satisfies PageServerLoad;

export const actions = {
  async togglePublic(event) {
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
