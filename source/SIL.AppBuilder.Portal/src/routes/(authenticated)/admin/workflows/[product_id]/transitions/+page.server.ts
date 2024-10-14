import { prisma, type Prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad, Actions } from './$types';
import { tableSchema } from '$lib/table';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as m from '$lib/paraglide/messages';

export const load: PageServerLoad = async (event) => {
  const transitions = await prisma.productTransitions.findMany({
    where: {
      ProductId: event.params.product_id,
      TransitionType: 1
    },
    select: {
      AllowedUserNames: true,
      InitialState: true,
      DateTransition: true,
      Command: true
    },
    take: 20
  });

  const count = await prisma.productTransitions.count({
    where: {
      ProductId: event.params.product_id,
      TransitionType: 1
    }
  });

  return {
    transitions,
    count,
    form: await superValidate(
      {
        page: 0,
        size: 20
      },
      valibot(tableSchema)
    )
  };
};

export const actions: Actions = {
  page: async function (event) {
    const form = await superValidate(event.request, valibot(tableSchema));

    const scripSearch =
      form.data.search.text !== null
        ? (m.appName() as string).match(new RegExp(form.data.search.text))
        : false;

    const where: Prisma.ProductTransitionsWhereInput = {
      ProductId: event.params.product_id,
      TransitionType: 1,
      OR:
        form.data.search.field === null && form.data.search.text
          ? [
              {
                OR: scripSearch
                  ? [
                      {
                        AllowedUserNames: {
                          contains: form.data.search.text,
                          mode: 'insensitive'
                        }
                      },
                      {
                        OR: [
                          {
                            AllowedUserNames: ''
                          },
                          {
                            AllowedUserNames: null
                          }
                        ]
                      }
                    ]
                  : undefined,
                AllowedUserNames: scripSearch
                  ? undefined
                  : {
                      contains: form.data.search.text,
                      mode: 'insensitive'
                    }
              },
              {
                InitialState: {
                  contains: form.data.search.text,
                  mode: 'insensitive'
                }
              },
              {
                Command: {
                  contains: form.data.search.text,
                  mode: 'insensitive'
                }
              }
            ]
          : form.data.search.field !== null && form.data.search.text && scripSearch
          ? [
              {
                AllowedUserNames: {
                  contains: form.data.search.text,
                  mode: 'insensitive'
                }
              },
              {
                OR: [
                  {
                    AllowedUserNames: ''
                  },
                  {
                    AllowedUserNames: null
                  }
                ]
              }
            ]
          : undefined,
      [form.data.search.field!]:
        form.data.search.field &&
        form.data.search.text &&
        !(form.data.search.field === 'AllowedUserNames' && scripSearch)
          ? {
              contains: form.data.search.text,
              mode: 'insensitive'
            }
          : undefined
    };

    const transitions = await prisma.productTransitions.findMany({
      orderBy: form.data.sort
        ? form.data.sort.map((s) => ({
            [s.field]: s.direction
          }))
        : undefined,
      where: where,
      select: {
        AllowedUserNames: true,
        InitialState: true,
        DateTransition: true,
        Command: true
      },
      skip: form.data.size * form.data.page,
      take: form.data.size
    });

    const count = await prisma.productTransitions.count({
      where: where
    });

    //console.log({ form, query: { data: transitions, count }});

    return { form, ok: form.valid, query: { data: transitions, count } };
  }
};
