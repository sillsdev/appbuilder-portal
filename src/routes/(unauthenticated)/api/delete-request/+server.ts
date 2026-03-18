import { json } from '@sveltejs/kit';
import { randomInt } from 'crypto';
import type { RequestHandler } from './$types';
import { DatabaseWrites } from '$lib/server/database';
import { sendEmail } from '$lib/server/email-service/EmailClient';
import { EmailLayoutTemplate, addProperties } from '$lib/server/email-service/EmailTemplates';

export const POST: RequestHandler = async ({ locals, request }) => {
  // Security check
  locals.security.requireNothing();

  const { email, token, productId } = await request.json();

  if (!email || !token || !productId) return json({ success: false }, { status: 400 });
  const normalizedEmail = String(email).trim().toLowerCase();

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('Turnstile secret key is not configured');
    return json({ success: false }, { status: 500 });
  }
  const formData = new URLSearchParams();

  formData.append('secret', secret);
  formData.append('response', token);

  const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData
  });

  const result = await verification.json();

  if (!result.success) {
    console.warn('Turnstile verification failed', {
      errorCodes: result['error-codes'],
      hostname: result.hostname,
      action: result.action
    });
    return json({ success: false }, { status: 400 });
  }

  // Generate a verification code and store it with an expiration time. This expiration time is 10 minutes, and is automatically reduced by a minute if the user types the wrong code to prevent brute-force attempts.
  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[UDM TEST] Verification code for ${normalizedEmail} (product ${productId}): ${code}`
    );
  }

  await DatabaseWrites.productUserChanges.create({
    data: {
      ProductId: productId,
      Email: normalizedEmail,
      Change: 'User data deletion request verification',
      ConfirmationCode: code,
      DateExpires: expiresAt,
      DateConfirmed: null
    }
  });

  await sendEmail(
    [{ email: normalizedEmail, name: normalizedEmail }],
    'Your verification code',
    addProperties(EmailLayoutTemplate, {
      INSERT_SUBJECT: `Your code is: ${code}`,
      INSERT_CONTENT: `Your code is: ${code}`
    })
  );

  return json({ success: true });
};
