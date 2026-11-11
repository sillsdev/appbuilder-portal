import type { Prisma } from '@prisma/client';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';
import { filterSupportData } from '$lib/support-data/server';
import { paginateSchema } from '$lib/valibot';

const tableSchema = v.object({
  page: paginateSchema
});

async function querySupportData(where: Prisma.SupportDataWhereInput, page: number, size: number) {
  return Promise.all([
    DatabaseReads.supportData.count({ where }),
    DatabaseReads.supportData.findMany({
      where,
      orderBy: [{ DateUploaded: 'desc' }, { Organization: { Name: 'asc' } }, { Id: 'asc' }],
      include: {
        Organization: {
          select: {
            Id: true,
            Name: true
          }
        },
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
}

export const load: PageServerLoad = async (event) => {
  const orgId = event.params.orgId ? Number(event.params.orgId) : undefined;
  event.locals.security.requireSupportDataAccess(orgId);
  const security = event.locals.security;

  const [count, items] = await querySupportData(filterSupportData(security, orgId), 0, 25);

  return {
    items,
    count,
    orgId,
    form: await superValidate(
      {
        page: {
          page: 0,
          size: 25
        }
      },
      valibot(tableSchema)
    )
  };
};

export const actions: Actions = {
  page: async ({ request, locals, params }) => {
    const orgId = params.orgId ? Number(params.orgId) : undefined;
    locals.security.requireSupportDataAccess(orgId);
    const form = await superValidate(request, valibot(tableSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const [count, items] = await querySupportData(
      filterSupportData(locals.security, orgId),
      form.data.page.page,
      form.data.page.size
    );

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
