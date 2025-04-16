import { idSchema } from '$lib/valibot';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const togglePublicSchema = v.object({
  orgId: idSchema,
  publicByDefault: v.boolean()
});

const toggleProductSchema = v.object({
  orgId: idSchema,
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
    if (form.data.orgId !== parseInt(event.params.id)) return fail(404, { form, ok: false });
    await DatabaseWrites.organizations.update({
      where: {
        Id: form.data.orgId
      },
      data: {
        PublicByDefault: form.data.publicByDefault // TODO: what are we doing with this?
      }
    });
    return { form, ok: true };
  },
  async toggleProduct(event) {
    const form = await superValidate(event.request, valibot(toggleProductSchema));
    console.log(form);
    if (!form.valid) return fail(400, { form, ok: false });
    if (form.data.orgId !== parseInt(event.params.id)) return fail(404, { form, ok: false });
    await DatabaseWrites.organizationProductDefinitions.toggleForOrg(
      form.data.orgId,
      form.data.prodDefId,
      form.data.enabled
    );

    return { form, ok: true };
  }
} satisfies Actions;
