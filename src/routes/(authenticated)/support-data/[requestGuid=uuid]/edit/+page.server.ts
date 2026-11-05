import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { orgsForSupportDataAccess } from '$lib/utils/roles';

export const load: PageServerLoad = async (event) => {
  event.locals.security.requireSupportDataAccess();
  const security = event.locals.security;

  const request = await DatabaseReads.supportData.findFirst({
    where: security.isSuperAdmin
      ? { Id: event.params.requestGuid }
      : {
          Id: event.params.requestGuid,
          OrganizationId: { in: orgsForSupportDataAccess(security.sessionForm.roles) }
        },
    include: {
      Organization: {
        select: {
          Id: true,
          Name: true
        }
      }
    }
  });

  if (!request) {
    throw error(404, 'Support data request not found');
  }
  security.requireSupportDataAccess(request.OrganizationId);

  return { request };
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    locals.security.requireSupportDataAccess();

    const formData = await request.formData();
    const name = String(formData.get('name') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const ticketUrl = String(formData.get('ticketUrl') ?? '').trim();
    const values = { name, description, ticketUrl };

    if (!name) {
      return fail(400, { message: 'Name is required.', values });
    }
    if (name.length > 200) {
      return fail(400, { message: 'Name must be 200 characters or fewer.', values });
    }
    if (description.length > 5000) {
      return fail(400, { message: 'Description must be 5000 characters or fewer.', values });
    }

    let parsedTicketUrl: URL;
    try {
      parsedTicketUrl = new URL(ticketUrl);
    } catch {
      return fail(400, { message: 'Enter a valid ticket URL.', values });
    }

    if (parsedTicketUrl.protocol !== 'http:' && parsedTicketUrl.protocol !== 'https:') {
      return fail(400, { message: 'Ticket URL must use HTTP or HTTPS.', values });
    }

    const existingRequest = await DatabaseReads.supportData.findFirst({
      where: locals.security.isSuperAdmin
        ? { Id: params.requestGuid }
        : {
            Id: params.requestGuid,
            OrganizationId: {
              in: orgsForSupportDataAccess(locals.security.sessionForm.roles)
            }
          },
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
        Name: name,
        Description: description || null,
        TicketUrl: ticketUrl
      }
    });

    throw redirect(303, localizeHref(`/support-data/${params.requestGuid}`));
  }
};
