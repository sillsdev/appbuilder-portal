import { error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { filterSupportData } from '$lib/support-data/server';
import { supportDataFields } from '$lib/supportData';

const editSupportDataSchema = v.object(supportDataFields);

export const load: PageServerLoad = async (event) => {
  event.locals.security.requireSupportDataAccess();
  const security = event.locals.security;

  const request = await DatabaseReads.supportData.findFirst({
    where: { Id: event.params.requestGuid, ...filterSupportData(security) },
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
    }
  });

  if (!request) {
    throw error(404, 'Support data request not found');
  }
  security.requireSupportDataAccess(request.OrganizationId);

  return {
    request,
    form: await superValidate(
      {
        name: request.Name,
        description: request.Description ?? '',
        ticketUrl: request.TicketUrl ?? ''
      },
      valibot(editSupportDataSchema)
    )
  };
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    locals.security.requireSupportDataAccess();
    const form = await superValidate(request, valibot(editSupportDataSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const existingRequest = await DatabaseReads.supportData.findFirst({
      where: { Id: params.requestGuid, ...filterSupportData(locals.security) },
      select: {
        Id: true,
        OrganizationId: true
      }
    });

    if (!existingRequest) {
      throw error(404, 'Support data request not found');
    }
    locals.security.requireSupportDataAccess(existingRequest.OrganizationId);

    await DatabaseWrites.supportData.update({
      where: { Id: params.requestGuid },
      data: {
        Name: form.data.name,
        Description: form.data.description || null,
        TicketUrl: form.data.ticketUrl || null
      }
    });

    return { form, ok: true };
  }
};
