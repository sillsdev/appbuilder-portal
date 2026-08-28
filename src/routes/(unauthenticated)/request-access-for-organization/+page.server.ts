import { trace } from '@opentelemetry/api';
import { error, redirect } from '@sveltejs/kit';
import { randomInt, randomUUID } from 'node:crypto';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { m as gp } from '$lib/google-play/paraglide/messages';
import { type Locale, localizeHref } from '$lib/paraglide/runtime';
import { getAuthConnection } from '$lib/server/bullmq/queues';
import { DatabaseReads } from '$lib/server/database';
import { sendEmail } from '$lib/server/email-service/EmailClient';
import { resolveToken, verifyToken } from '$lib/turnstile/server';

const tracer = trace.getTracer('OrgInviteRequest');

const requestSchema = v.objectAsync({
  organizationName: v.pipe(v.string(), v.trim(), v.nonEmpty()),
  email: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.email()),
  url: v.pipeAsync(v.string(), v.trim(), v.nonEmpty(), v.url()),
  turnstileToken: v.pipe(v.string(), v.trim(), v.nonEmpty())
});

export const load = (async ({ locals }) => {
  locals.security.requireNothing();
  return tracer.startActiveSpan('Org Invite - Load Request Page', async (span) => {
    try {
      return {
        publicOrgExists: !!(await DatabaseReads.organizations.findFirst({
          where: { VisibleToPublic: true },
          select: {
            Id: true
          }
        })),
        form: await superValidate(valibot(requestSchema))
      };
    } finally {
      span.end();
    }
  });
}) satisfies PageServerLoad;

export const actions = {
  async request({ locals, request }) {
    locals.security.requireNothing();
    return tracer.startActiveSpan('Org Invite - Process Request', async (span) => {
      try {
        const formData = await request.formData();
        resolveToken(formData);
        const form = await superValidate(formData, valibot(requestSchema));
        console.log(form);
        if (!form.valid) return fail(400, { form, ok: false });

        const verifyResult = await verifyToken(
          form.data.turnstileToken,
          env.ORG_REQUEST_TURNSTILE_SECRET_KEY
        );

        if (verifyResult !== 200) {
          // logging handled in verifyToken
          form.data.turnstileToken = '';
          return fail(verifyResult, { form, ok: false });
        }

        // code to use for exchange
        const requestId = randomUUID();
        const code = randomInt(100_000, 1_000_000).toString();

        try {
          await getAuthConnection().set(
            `org-invite:${requestId}`,
            JSON.stringify({ ...form.data, code }),
            'EX',
            600
          ); // 10 minute (600 s) TTL

          await sendEmail(
            [{ email: form.data.email, name: form.data.organizationName }],
            gp.email_subject({}, { locale: locals.locale as Locale }),
            gp.email_body({ code }, { locale: locals.locale as Locale })
          );
        } catch {
          error(500, 'Failed to generate request email');
        }
        redirect(303, localizeHref(`/request-access-for-organization/verify/${requestId}`));
      } finally {
        span.end();
      }
    });
  }
} satisfies Actions;
