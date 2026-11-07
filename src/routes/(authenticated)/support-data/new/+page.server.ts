import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { validateSupportDataFields } from '$lib/supportData';
import { orgsForSupportDataAccess } from '$lib/utils/roles';

export const load: PageServerLoad = async ({ locals }) => {
  locals.security.requireSupportDataAccess();
  const security = locals.security;
  const organizations = await DatabaseReads.organizations.findMany({
    where: security.isSuperAdmin
      ? undefined
      : { Id: { in: orgsForSupportDataAccess(security.sessionForm.roles) } },
    select: {
      Id: true,
      Name: true
    },
    orderBy: { Name: 'asc' }
  });
  return { organizations };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    locals.security.requireSupportDataAccess();

    const formData = await request.formData();
    const organizationId = Number(formData.get('organizationId'));
    const name = String(formData.get('name') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const ticketUrl = String(formData.get('ticketUrl') ?? '').trim();
    const values = { organizationId, name, description, ticketUrl };

    if (!Number.isSafeInteger(organizationId) || organizationId <= 0) {
      return fail(400, { message: 'Select an organization.', values });
    }
    locals.security.requireSupportDataAccess(organizationId);

    const organization = await DatabaseReads.organizations.findUnique({
      where: { Id: organizationId },
      select: { Id: true }
    });
    if (!organization) {
      return fail(400, { message: 'Select a valid organization.', values });
    }
    const validationError = validateSupportDataFields(values);
    if (validationError) {
      return fail(400, { message: validationError, values });
    }

    const newRequest = await DatabaseWrites.supportData.create({
      data: {
        Name: name,
        Description: description || null,
        TicketUrl: ticketUrl,
        AgentId: locals.security.userId,
        OrganizationId: organizationId,
        DateUploaded: new Date()
      }
    });

    throw redirect(303, localizeHref(`/support-data/${newRequest.Id}`));
  }
};
