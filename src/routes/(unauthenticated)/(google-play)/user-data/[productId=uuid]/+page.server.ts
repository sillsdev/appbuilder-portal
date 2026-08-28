import { SpanStatusCode, trace } from '@opentelemetry/api';
import { error, fail } from '@sveltejs/kit';
import { randomInt } from 'crypto';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { type DeletionType, deletionTypes, localizedEmailSchema } from '$lib/google-play';
import { m } from '$lib/google-play/paraglide/messages';
import type { Locale } from '$lib/google-play/paraglide/runtime';
import { saveDeleteRequestVerificationCode } from '$lib/google-play/server';
import { DatabaseWrites } from '$lib/server/database';
import { sendEmail } from '$lib/server/email-service/EmailClient';
import { resolveToken, verifyToken } from '$lib/turnstile/server';
import { logLocalDev } from '$lib/utils/server';

const tracer = trace.getTracer('UDMRequests');

const localizedSchema = (locale: Locale) =>
  v.object({
    email: localizedEmailSchema(locale),
    turnstileToken: v.pipe(v.string(), v.minLength(1, m.alert_verify_human({}, { locale }))),
    deletionType: v.picklist(['data', 'account'])
  });

export const load: PageServerLoad = async ({ locals, parent, url }) => {
  locals.security.requireNothing();

  const requestedType = url.searchParams.get('type');
  const deletionType: DeletionType = deletionTypes.includes(requestedType as DeletionType)
    ? (requestedType as DeletionType)
    : 'data';

  return {
    form: await superValidate(
      { email: '', turnstileToken: '', deletionType },
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
        resolveToken(formData);

        const locale = locals.locale as Locale;

        const form = await superValidate(formData, valibot(localizedSchema(locale)));

        if (!form.valid) {
          return fail(400, { form });
        }

        const verifyResult = await verifyToken(
          form.data.turnstileToken,
          env.USER_DATA_TURNSTILE_SECRET_KEY
        );

        if (verifyResult !== 200) {
          // logging handled in verifyToken
          return message(
            form,
            { error: m.alert_verification_failed({}, { locale }) },
            { status: verifyResult }
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
          logLocalDev?.(e);
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
          logLocalDev?.(e);
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
        logLocalDev?.(e);
        return error(500);
      } finally {
        span.end();
      }
    });
  }
};
