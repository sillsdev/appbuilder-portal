import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';
import { paginateSchema } from '$lib/valibot';

const tableSchema = v.object({
  page: paginateSchema
});

export const load: PageServerLoad = async (event) => {
  event.locals.security.requireSupportDataAccess();

  const page = Number(event.url.searchParams.get('page') ?? '0');
  const size = Number(event.url.searchParams.get('size') ?? '25');
  const safePage = Number.isFinite(page) && page >= 0 ? page : 0;
  const safeSize = Number.isFinite(size) && size > 0 ? size : 25;

  const [count, items] = await Promise.all([
    DatabaseReads.supportData.count(),
    DatabaseReads.supportData.findMany({
      orderBy: { DateUploaded: 'desc' },
      include: {
        Agent: {
          select: {
            Id: true,
            Name: true,
            Email: true
          }
        }
      },
      skip: safePage * safeSize,
      take: safeSize
    })
  ]);

  return {
    items,
    count,
    form: await superValidate(
      {
        page: {
          page: safePage,
          size: safeSize
        }
      },
      valibot(tableSchema)
    )
  };
};

export const actions: Actions = {
  page: async ({ request, locals }) => {
    locals.security.requireSupportDataAccess();
    const form = await superValidate(request, valibot(tableSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const page = form.data.page.page;
    const size = form.data.page.size;
    const [count, items] = await Promise.all([
      DatabaseReads.supportData.count(),
      DatabaseReads.supportData.findMany({
        orderBy: { DateUploaded: 'desc' },
        include: {
          Agent: {
            select: {
              Id: true,
              Name: true,
              Email: true
            }
          }
        },
        skip: page * size,
        take: size
      })
    ]);

    return {
      form,
      ok: true,
      query: {
        data: items,
        count
      }
    };
  }
};
