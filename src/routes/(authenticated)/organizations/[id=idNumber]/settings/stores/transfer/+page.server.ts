import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { idSchema, stringIdSchema } from '$lib/valibot';

const transferSchema = v.object({
  source: idSchema,
  destination: idSchema,
  products: v.array(stringIdSchema)
});

export const load = (async (event) => {
  event.locals.security.requireAdminOfOrg(parseInt(event.params.id));
  const { organization } = await event.parent();
  return {
    storeTypes: await DatabaseReads.storeTypes.findMany(),
    stores: await DatabaseReads.stores.findMany({
      where: {
        Organizations: { some: { Id: organization.Id } },
        OR: [
          {
            OwnerId: null
          },
          {
            OwnerId: organization.Id
          }
        ]
      },
      include: {
        Products: {
          where: {
            Project: {
              OrganizationId: organization.Id,
              DateArchived: null
            }
          },
          select: {
            Id: true,
            ProductDefinition: {
              select: {
                Name: true
              }
            },
            Project: {
              select: {
                Name: true
              }
            }
          }
        }
      }
    }),
    form: await superValidate(valibot(transferSchema))
  };
}) satisfies PageServerLoad;

export const actions = {
  async transfer(event) {
    const orgId = parseInt(event.params.id);
    event.locals.security.requireAdminOfOrg(orgId);
    const form = await superValidate(event.request, valibot(transferSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const source = await DatabaseReads.stores.findUnique({
      where: {
        Id: form.data.source,
        Organizations: {
          some: { Id: orgId }
        },
        OR: [
          {
            OwnerId: null
          },
          {
            OwnerId: orgId
          }
        ]
      },
      select: {
        Products: {
          where: { Id: { in: form.data.products }, Project: { OrganizationId: orgId } },
          select: { Id: true }
        }
      }
    });

    const destination = await DatabaseReads.stores.findUnique({
      where: {
        Id: form.data.destination,
        Organizations: {
          some: { Id: orgId }
        },
        OR: [
          {
            OwnerId: null
          },
          {
            OwnerId: orgId
          }
        ]
      }
    });

    if (!(source && destination)) return fail(404, { form, ok: false });

    const res = await Promise.all(
      source.Products.map((p) =>
        DatabaseWrites.products.update(p.Id, { StoreId: form.data.destination })
      )
    );

    return { form, ok: res.every((r) => r) };
  }
} satisfies Actions;
