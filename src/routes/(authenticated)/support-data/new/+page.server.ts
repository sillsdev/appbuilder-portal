import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseWrites } from '$lib/server/database';

export const load: PageServerLoad = async (event) => {
  event.locals.security.requireSupportDataAccess();
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    locals.security.requireSupportDataAccess();

    const formData = await request.formData();
    const ticketUrl = String(formData.get('ticketUrl') ?? '').trim();

    if (!ticketUrl) {
      return fail(400, { message: 'Ticket URL is required.' });
    }

    const newRequest = await DatabaseWrites.supportData.create({
      data: {
        TicketUrl: ticketUrl,
        AgentId: locals.security.userId,
        DateUploaded: new Date()
      }
    });

    throw redirect(303, `/support-data/${newRequest.Id}`);
  }
};
