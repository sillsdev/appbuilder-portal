import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad, Actions } from './$types';
import { paginateSchema } from '$lib/table';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async (event) => {
  const transitions = await prisma.productTransitions.findMany({
    where: {
      ProductId: event.params.product_id,
      TransitionType: 1
    },
    select: {
      AllowedUserNames: true,
      InitialState: true,
      DestinationState: true,
      DateTransition: true,
      Command: true,
      Comment: true,
    },
    take: 5
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
        size: 5
      },
      valibot(paginateSchema)
    )
  };
};

export const actions: Actions = {
  page: async function (event) {

    const form = await superValidate(event.request, valibot(paginateSchema));

    const transitions = await prisma.productTransitions.findMany({
      where: {
        ProductId: event.params.product_id,
        TransitionType: 1
      },
      select: {
        AllowedUserNames: true,
        InitialState: true,
        DestinationState: true,
        DateTransition: true,
        Command: true,
        Comment: true,
      },
      skip: form.data.size * form.data.page,
      take: form.data.size
    });
  
    const count = await prisma.productTransitions.count({
      where: {
        ProductId: event.params.product_id,
        TransitionType: 1
      }
    });

    //console.log({ form, query: { data: transitions, count }});

    return { form, ok: form.valid, query: { data: transitions, count }};
  }
}
