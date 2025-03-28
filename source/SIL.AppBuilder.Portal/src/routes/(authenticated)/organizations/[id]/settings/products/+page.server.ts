import { idSchema } from '$lib/valibot';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const editProductsSchema = v.object({
  id: idSchema,
  publicByDefault: v.boolean(),
  products: v.array(
    v.object({
      productId: idSchema,
      enabled: v.boolean()
    })
  )
});
export const load = (async (event) => {
  const { organization } = await event.parent();
  const orgProductDefs = await prisma.organizationProductDefinitions.findMany({
    where: {
      OrganizationId: organization.Id
    }
  });
  const allProductDefs = (await prisma.productDefinitions.findMany()).map(
    (pd) => [pd.Id, pd] as [number, typeof pd]
  );
  const setOrgProductDefs = new Set(orgProductDefs.map((p) => p.ProductDefinitionId));
  const form = await superValidate(
    {
      id: organization.Id,
      publicByDefault: organization.PublicByDefault ?? false,
      products: allProductDefs.map((pD) => ({
        productId: pD[0],
        enabled: setOrgProductDefs.has(pD[0])
      }))
    },
    valibot(editProductsSchema)
  );
  return { orgProductDefs, allProductDefs, form };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event.request, valibot(editProductsSchema));
    if (!form.valid) return fail(400, { form, ok: false, errors: form.errors });
    await DatabaseWrites.organizationProductDefinitions.updateOrganizationProductDefinitions(
      form.data.id,
      form.data.products.filter((p) => p.enabled).map((p) => p.productId)
    );
    await DatabaseWrites.organizations.update({
      where: {
        Id: form.data.id
      },
      data: {
        PublicByDefault: form.data.publicByDefault // TODO: what are we doing with this?
      }
    });
    return { ok: true, form };
  }
} satisfies Actions;
