import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad, Actions } from './$types';
import { tableSchema } from '$lib/table';
import { superValidate, fail } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
  const instances = await prisma.workflowInstances.findMany({
    select: {
      Product: {
        select: {
          Id: true,
          ProductTransitions: {
            where: {
              DateTransition: {
                not: null
              }
            },
            select: {
              DateTransition: true,
              DestinationState: true
            },
            orderBy: [
              {
                DateTransition: 'desc'
              }
            ],
            take: 1
          }
        }
      }
    },
    take: 20
  });

  const count = await prisma.productTransitions.count();
  return {
    instances,
    count,
    form: await superValidate(
      {
        page: {
          page: 0,
          size: 20
        }
      },
      valibot(tableSchema)
    )
  };
};

export const actions: Actions = {
  page: async function ({ request, locals }) {
    const session = await locals.auth();
    if ((session?.user.roles.filter(([org, role]) => role === RoleId.SuperAdmin) ?? []).length < 1)
      return error(403);
    const form = await superValidate(request, valibot(tableSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const search = form.data.search.text
      ? new RegExp(
          // escape regex special characters: https://stackoverflow.com/a/6969486
          form.data.search.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), //
          'i'
        )
      : null;

    let instances = await prisma.workflowInstances.findMany({
      orderBy: form.data.sort?.find((s) => s.field === 'product')
        ? { ProductId: form.data.sort?.find((s) => s.field === 'product')?.direction }
        : undefined,
      select: {
        Product: {
          select: {
            Id: true,
            ProductTransitions: {
              where: {
                DateTransition: {
                  not: null
                }
              },
              select: {
                DateTransition: true,
                DestinationState: true
              },
              orderBy: [
                {
                  DateTransition: 'desc'
                }
              ],
              take: 1
            }
          }
        }
      }
    });

    // I don't like that I have to do it this way, but there does not appear to be a good way to do this on the database side
    if (search) {
      if (!form.data.search.field) {
        instances = instances.filter(
          (i) =>
            search.test(i.Product.Id) ||
            search.test(i.Product.ProductTransitions[0].DestinationState ?? '')
        );
      } else if (form.data.search.field === 'product') {
        instances = instances.filter((i) => search.test(i.Product.Id));
      } else if (form.data.search.field === 'state') {
        instances = instances.filter((i) =>
          search.test(i.Product.ProductTransitions[0].DestinationState ?? '')
        );
      }
    }

    instances = form.data.sort?.find((s) => s.field === 'date')
      ? instances.sort(
          form.data.sort?.find((s) => s.field === 'date')?.direction === 'asc'
            ? (a, b) => {
                return (
                  a.Product.ProductTransitions[0].DateTransition?.getTime()! -
                  b.Product.ProductTransitions[0].DateTransition?.getTime()!
                );
              }
            : (a, b) => {
                return (
                  b.Product.ProductTransitions[0].DateTransition?.getTime()! -
                  a.Product.ProductTransitions[0].DateTransition?.getTime()!
                );
              }
        )
      : instances;

    instances = form.data.sort?.find((s) => s.field === 'state')
      ? instances.sort(
          form.data.sort?.find((s) => s.field === 'state')?.direction === 'asc'
            ? (a, b) => {
                return a.Product.ProductTransitions[0].DestinationState!.localeCompare(
                  b.Product.ProductTransitions[0].DestinationState!
                );
              }
            : (a, b) => {
                return b.Product.ProductTransitions[0].DestinationState!.localeCompare(
                  a.Product.ProductTransitions[0].DestinationState!
                );
              }
        )
      : instances;

    const count = instances.length;

    return {
      form,
      ok: true,
      query: {
        data: instances.slice(
          form.data.page.page * form.data.page.size,
          (form.data.page.page + 1) * form.data.page.size
        ),
        count
      }
    };
  }
};
