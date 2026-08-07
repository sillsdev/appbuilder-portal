import { SpanStatusCode, trace } from '@opentelemetry/api';
import { error, fail } from '@sveltejs/kit';
import { randomInt } from 'crypto';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { localizedEmailSchema } from '$lib/google-play';
import { m } from '$lib/google-play/paraglide/messages';
import type { Locale } from '$lib/google-play/paraglide/runtime';
import { saveDeleteRequestVerificationCode } from '$lib/google-play/server';
import { DatabaseWrites } from '$lib/server/database';
import { sendEmail } from '$lib/server/email-service/EmailClient';

const tracer = trace.getTracer('UDMRequests');

const TURNSTILE_TIMEOUT_MS = 5000;

const localizedSchema = (locale: Locale) =>
  v.object({
    email: localizedEmailSchema(locale),
    turnstileToken: v.pipe(v.string(), v.minLength(1, m.alert_verify_human({}, { locale }))),
    deletionType: v.picklist(['data', 'account'])
  });

export const load: PageServerLoad = async ({ locals, parent }) => {
  locals.security.requireNothing();

  return {
    form: await superValidate(
      { email: '', turnstileToken: '', deletionType: 'data' as const },
      valibot(localizedSchema(locals.locale as Locale))
    )
  };
};

export const actions: Actions = {
  sendCode: async ({ request, locals, params }) => {
    locals.security.requireNothing();
    return tracer.startActiveSpan('UDM - Send Code', async (span) => {
      try {
        const formData = await request.formData();
        const turnstileToken = formData.get('turnstileToken');
        const turnstileResponse = formData.get('cf-turnstile-response');

        if (
          (!turnstileToken || (typeof turnstileToken === 'string' && !turnstileToken.trim())) &&
          typeof turnstileResponse === 'string'
        ) {
          formData.set('turnstileToken', turnstileResponse);
        }

        const locale = locals.locale as Locale;

        const form = await superValidate(formData, valibot(localizedSchema(locale)));

        if (!form.valid) {
          return fail(400, { form });
        }

        const token = form.data.turnstileToken.trim();

        const secret = env.TURNSTILE_SECRET_KEY;
        if (!secret) {
          span.recordException('Turnstile secret key is not configured');
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: 'Turnstile secret key is not configured'
          });
          return message(
            form,
            { error: m.alert_verification_failed({}, { locale }) },
            { status: 500 }
          );
        }

        let verification: Response;
        try {
          verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: new URLSearchParams({ secret, response: token }),
            signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS)
          });
        } catch (e) {
          span.recordException(e as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (e as Error).message
          });
          console.warn('Turnstile verification request failed', { error: e });
          return message(
            form,
            { error: m.alert_verification_failed({}, { locale }) },
            { status: 503 }
          );
        }

        const result = await verification.json().catch(() => null);
        if (!verification.ok || !result || typeof result.success !== 'boolean') {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: `Turnstile verification returned an invalid response: ${JSON.stringify(result)}`
          });
          console.warn('Turnstile verification returned an invalid response', {
            status: verification.status
          });
          return message(
            form,
            { error: m.alert_verification_failed({}, { locale }) },
            { status: 502 }
          );
        }

        if (!result.success) {
          console.warn('Turnstile verification failed', {
            errorCodes: result['error-codes'],
            hostname: result.hostname,
            action: result.action
          });
          return message(
            form,
            { error: m.alert_verification_failed({}, { locale }) },
            { status: 400 }
          );
        }

        const code = randomInt(100_000, 1_000_000).toString();

        let pendingRequestId: string;

        try {
          const pendingRequest = await saveDeleteRequestVerificationCode({
            productId: params.productId,
            email: form.data.email,
            change: form.data.deletionType,
            code,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000 /* 10 minutes */)
          });
          pendingRequestId = pendingRequest.Id;
        } catch (e) {
          span.recordException(e as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (e as Error).message
          });
          console.error(e);
          return message(
            form,
            { error: m.alert_verification_failed({}, { locale }) },
            { status: 500 }
          );
        }

        try {
          await sendEmail(
            [{ email: form.data.email, name: form.data.email }],
            m.email_subject({}, { locale }),
            m.email_body({ code }, { locale })
          );
        } catch (e) {
          span.recordException(e as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (e as Error).message
          });
          await DatabaseWrites.productUserChanges.update({
            where: {
              Id: pendingRequestId
            },
            data: {
              // update to immediate expiry
              DateExpires: new Date()
            }
          });
          console.error(e);
          return message(
            form,
            { error: m.alert_verification_failed({}, { locale }) },
            { status: 500 }
          );
        }

        return { form, ok: true };
      } catch (e) {
        span.recordException(e as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (e as Error).message
        });
        console.error(e);
        return error(500);
      } finally {
        span.end();
      }
    });
  }
};
