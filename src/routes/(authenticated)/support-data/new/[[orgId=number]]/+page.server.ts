import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { filterSupportDataOrgs } from '$lib/support-data/server';
import { supportDataFields } from '$lib/supportData';
import { idSchema } from '$lib/valibot';

const newSupportDataSchema = v.object({
  organizationId: v.pipe(idSchema, v.minValue(1)),
  ...supportDataFields
});

export const load: PageServerLoad = async ({ locals, params }) => {
  const orgId = params.orgId ? Number(params.orgId) : undefined;
  locals.security.requireSupportDataAccess(orgId);
  const security = locals.security;
  const organizations = await DatabaseReads.organizations.findMany({
    where: filterSupportDataOrgs(security),
    select: {
      Id: true,
      Name: true
    },
    orderBy: { Name: 'asc' }
  });
  return {
    organizations,
    orgId,
    form: await superValidate(
      orgId ? { organizationId: orgId } : undefined,
      valibot(newSupportDataSchema)
    )
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    locals.security.requireSupportDataAccess();
    const form = await superValidate(request, valibot(newSupportDataSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    locals.security.requireSupportDataAccess(form.data.organizationId);

    const created = await DatabaseWrites.supportData.create({
      data: {
        Name: form.data.name,
        Description: form.data.description || null,
        TicketUrl: form.data.ticketUrl || null,
        AgentId: locals.security.userId,
        OrganizationId: form.data.organizationId,
        DateUploaded: new Date()
      }
    });

    return { form, ok: true, createdId: created.Id };
  }
};
