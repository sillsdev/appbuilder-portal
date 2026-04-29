import { error, fail } from '@sveltejs/kit';
import { randomInt } from 'crypto';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { m } from '$lib/google-play/paraglide/messages';
import type { Locale } from '$lib/google-play/paraglide/runtime';
import { saveDeleteRequestVerificationCode } from '$lib/google-play/server/udm';
import { DatabaseWrites } from '$lib/server/database';
import { sendEmail } from '$lib/server/email-service/EmailClient';

const TURNSTILE_TIMEOUT_MS = 5000;

function createDeleteRequestSchema(locale: Locale) {
  const uuidSchema = v.pipe(v.string(), v.uuid(m.udm_error_invalid_product_id({}, { locale })));

  return v.object({
    email: v.pipe(v.string(), v.email(m.udm_alert_valid_email({}, { locale }))),
    turnstileToken: v.pipe(v.string(), v.minLength(1, m.udm_alert_verify_human({}, { locale }))),
    productId: uuidSchema,
    deletionType: v.picklist(['data', 'account'])
  });
}

export const load: PageServerLoad = async ({ locals, parent }) => {
  locals.security.requireNothing();
  // don't render in prod for now
  if (env.APP_ENV === 'prd') return error(404);

  const { productId } = await parent();
  const locale = locals.locale as Locale;
  const schema = createDeleteRequestSchema(locale);
  const form = await superValidate(
    { email: '', turnstileToken: '', productId, deletionType: 'data' as const },
    valibot(schema)
  );

  return { form };
};

export const actions: Actions = {
  sendCode: async ({ request, locals }) => {
    locals.security.requireNothing();
    const locale = locals.locale as Locale;
    const schema = createDeleteRequestSchema(locale);
    const requestFormData = await request.formData();
    const turnstileToken = requestFormData.get('turnstileToken');
    const turnstileResponse = requestFormData.get('cf-turnstile-response');

    if (
      (!turnstileToken || (typeof turnstileToken === 'string' && !turnstileToken.trim())) &&
      typeof turnstileResponse === 'string'
    ) {
      requestFormData.set('turnstileToken', turnstileResponse);
    }

    const form = await superValidate(requestFormData, valibot(schema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const normalizedEmail = form.data.email.trim().toLowerCase();
    const token = form.data.turnstileToken.trim();
    const productId = form.data.productId.trim();
    const deletionType = form.data.deletionType;
    const change =
      deletionType === 'account' ? 'Delete my account and all associated data' : 'Delete my data';

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      console.error('Turnstile secret key is not configured');
      return message(
        form,
        { error: m.udm_alert_verification_failed({}, { locale }) },
        { status: 500 }
      );
    }

    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);

    let verification: Response;
    try {
      verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS)
      });
    } catch (error) {
      console.warn('Turnstile verification request failed', { error });
      return message(
        form,
        { error: m.udm_alert_verification_failed({}, { locale }) },
        { status: 503 }
      );
    }

    const result = await verification.json().catch(() => null);
    if (!verification.ok || !result || typeof result.success !== 'boolean') {
      console.warn('Turnstile verification returned an invalid response', {
        status: verification.status
      });
      return message(
        form,
        { error: m.udm_alert_verification_failed({}, { locale }) },
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
        { error: m.udm_alert_verification_failed({}, { locale }) },
        { status: 400 }
      );
    }

    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let pendingRequestId: string;

    try {
      const pendingRequest = await saveDeleteRequestVerificationCode({
        productId,
        email: normalizedEmail,
        change,
        code,
        expiresAt
      });
      pendingRequestId = pendingRequest.Id;
    } catch (error) {
      console.error('Failed to store delete request verification code', { error, productId });
      return message(
        form,
        { error: m.udm_alert_verification_failed({}, { locale }) },
        { status: 500 }
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[UDM TEST] Verification code for ${normalizedEmail} (product ${productId}): ${code}`
      );
    }

    try {
      await sendEmail(
        [{ email: normalizedEmail, name: normalizedEmail }],
        m.udm_email_subject({}, { locale }),
        m.udm_email_body({ code }, { locale })
      );
    } catch (error) {
      await DatabaseWrites.productUserChanges.update({
        where: {
          Id: pendingRequestId
        },
        data: {
          DateUpdated: new Date(),
          DateExpires: new Date()
        }
      });
      console.error('Failed to send delete request verification email', {
        error,
        productId
      });
      return message(
        form,
        { error: m.udm_alert_verification_failed({}, { locale }) },
        { status: 500 }
      );
    }

    return message(form, { step: 'verify', email: normalizedEmail });
  }
};
