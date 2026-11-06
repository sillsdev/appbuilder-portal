import { SpanStatusCode, trace } from '@opentelemetry/api';
import { redirect } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { BullMQ, getQueues } from '$lib/server/bullmq';
import { getAuthConnection } from '$lib/server/bullmq/queues';

const tracer = trace.getTracer('OrgInviteRequest');

const codeSchema = v.object({ code: v.pipe(v.string(), v.trim(), v.digits(), v.length(6)) });

const requestSchema = v.nullable(
  v.pipe(
    v.string(),
    v.parseJson(),
    v.object({
      organizationName: v.pipe(v.string(), v.trim(), v.nonEmpty()),
      email: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.email()),
      url: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.url()),
      code: codeSchema.entries.code
    })
  )
);

export const load = (async ({ locals, params }) => {
  locals.security.requireNothing();
  return tracer.startActiveSpan('Org Invite - Load Verification page', async (span) => {
    span.setAttribute('org-invite.request-id', params.requestId);
    try {
      const key = `org-invite:${params.requestId}`;
      const request = v.safeParse(requestSchema, await getAuthConnection().get(key));

      if (request.success && request.output) {
        return {
          email: request.output.email,
          ttl: await getAuthConnection().ttl(key),
          form: await superValidate(valibot(codeSchema))
        };
      } else {
        redirect(308, localizeHref(`/request-access-for-organization`));
      }
    } finally {
      span.end();
    }
  });
}) satisfies PageServerLoad;

export const actions = {
  async verifyCode({ locals, request: eventRequest, params }) {
    locals.security.requireNothing();
    return tracer.startActiveSpan('Org Invite - Verify Code', async (span) => {
      span.setAttribute('org-invite.request-id', params.requestId);
      try {
        const key = `org-invite:${params.requestId}`;

        const request = v.safeParse(requestSchema, await getAuthConnection().get(key));
        if (!request.success || !request.output) return fail(404, { ok: false });

        const form = await superValidate(eventRequest, valibot(codeSchema));

        if (!form.valid || form.data.code !== request.output.code) {
          return fail(400, { form, ok: false, codeMatch: false });
        }

        try {
          //immediately invalidate
          await getAuthConnection().del(key);
        } catch {
          /* empty */
        }

        await getQueues().Emails.add(
          'Email SuperAdmins about new org ' + request.output.organizationName,
          {
            type: BullMQ.JobType.Email_NotifySuperAdminsOfNewOrganizationRequest,
            email: request.output.email,
            organizationName: request.output.organizationName,
            url: request.output.url
          }
        );
        return { form, ok: true };
      } catch (e) {
        span.recordException(e as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (e as Error).message
        });
        return fail(500, { ok: false });
      } finally {
        span.end();
      }
    });
  }
} satisfies Actions;
