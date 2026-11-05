import type { Prisma } from '@prisma/client';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';
import { orgsForSupportDataAccess } from '$lib/utils/roles';

const tableSchema = v.object({
  page: v.object({
    page: v.pipe(v.number(), v.integer(), v.minValue(0)),
    size: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100))
  })
});

function visibleWhere(security: App.Locals['security']): Prisma.SupportDataWhereInput {
  return security.isSuperAdmin
    ? {}
    : { OrganizationId: { in: orgsForSupportDataAccess(security.sessionForm.roles) } };
}

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
  event.locals.security.requireSupportDataAccess();
  const security = event.locals.security;

  const [count, items] = await querySupportData(visibleWhere(security), 0, 25);

  return {
    items,
    count,
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
  page: async ({ request, locals }) => {
    locals.security.requireSupportDataAccess();
    const form = await superValidate(request, valibot(tableSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const [count, items] = await querySupportData(
      visibleWhere(locals.security),
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
