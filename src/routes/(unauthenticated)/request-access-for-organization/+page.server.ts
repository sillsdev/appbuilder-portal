import { trace } from '@opentelemetry/api';
import { api } from '@opentelemetry/sdk-node';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { BullMQ, getQueues } from '$lib/server/bullmq';

const requestSchema = v.object({
  organizationName: v.pipe(v.string(), v.nonEmpty()),
  email: v.pipe(v.string(), v.nonEmpty(), v.email()),
  url: v.pipe(v.string(), v.nonEmpty())
});

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  async request(event) {
    const form = await superValidate(event.request, valibot(requestSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await getQueues().Emails.add('Email SuperAdmins about new org ' + form.data.organizationName, {
      type: BullMQ.JobType.Email_NotifySuperAdminsOfNewOrganizationRequest,
      OTContext: trace.getSpanContext(api.context.active()),
      email: form.data.email,
      organizationName: form.data.organizationName,
      url: form.data.url
    });
    return { form, ok: true };
  }
} satisfies Actions;
