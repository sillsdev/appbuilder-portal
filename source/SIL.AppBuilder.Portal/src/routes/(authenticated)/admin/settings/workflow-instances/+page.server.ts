import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad, Actions } from './$types';
import { paginateSchema } from '$lib/table';
import { superValidate, fail } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';
import * as m from '$lib/paraglide/messages';

const tableSchema = v.object({
  page: paginateSchema,
  sort: v.nullable(
    v.array(
      v.object({
        field: v.string(),
        direction: v.picklist(['asc', 'desc'])
      })
    )
  ),
  search: v.object({
    field: v.nullable(v.string()),
    text: v.nullable(v.string())
  })
});

const typeNames = [
  '',
  m.admin_settings_workflowDefinitions_workflowTypes_1(),
  m.admin_settings_workflowDefinitions_workflowTypes_2(),
  m.admin_settings_workflowDefinitions_workflowTypes_3()
];

export const load: PageServerLoad = async (event) => {
  const instances = (
    await prisma.workflowInstances.findMany({
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
                DestinationState: true,
                InitialState: true,
                WorkflowType: true
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
      take: 50
    })
  ).map((wi) => ({
    Id: wi.Product.Id,
    Transition: {
      State:
        wi.Product.ProductTransitions[0].DestinationState ??
        wi.Product.ProductTransitions[0].InitialState ??
        typeNames[wi.Product.ProductTransitions[0].WorkflowType ?? 1],
      Date: wi.Product.ProductTransitions[0].DateTransition
    }
  }));

  const count = await prisma.productTransitions.count();
  return {
    instances,
    count,
    form: await superValidate(
      {
        page: {
          page: 0,
          size: 50
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

    let instances = (
      await prisma.workflowInstances.findMany({
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
                  DestinationState: true,
                  InitialState: true,
                  WorkflowType: true
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
      })
    ).map((wi) => ({
      Id: wi.Product.Id,
      Transition: {
        State:
          wi.Product.ProductTransitions[0].DestinationState ??
          wi.Product.ProductTransitions[0].InitialState ??
          typeNames[wi.Product.ProductTransitions[0].WorkflowType ?? 1],
        Date: wi.Product.ProductTransitions[0].DateTransition
      }
    }));

    // I don't like that I have to do it this way, but there does not appear to be a good way to do this on the database side
    if (search) {
      if (!form.data.search.field) {
        instances = instances.filter(
          (i) => search.test(i.Id) || search.test(i.Transition.State ?? '')
        );
      } else if (form.data.search.field === 'product') {
        instances = instances.filter((i) => search.test(i.Id));
      } else if (form.data.search.field === 'state') {
        instances = instances.filter((i) => search.test(i.Transition.State ?? ''));
      }
    }

    instances = form.data.sort?.find((s) => s.field === 'date')
      ? instances.sort(
          form.data.sort?.find((s) => s.field === 'date')?.direction === 'asc'
            ? (a, b) => {
                return a.Transition.Date?.getTime()! - b.Transition.Date?.getTime()!;
              }
            : (a, b) => {
                return b.Transition.Date?.getTime()! - a.Transition.Date?.getTime()!;
              }
        )
      : instances;

    instances = form.data.sort?.find((s) => s.field === 'state')
      ? instances.sort(
          form.data.sort?.find((s) => s.field === 'state')?.direction === 'asc'
            ? (a, b) => {
                return a.Transition.State!.localeCompare(b.Transition.State!);
              }
            : (a, b) => {
                return b.Transition.State!.localeCompare(a.Transition.State!);
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
