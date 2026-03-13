import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

interface DeleteRequestBody {
  email: string;
  deletionType: 'data' | 'account';
  turnstileToken: string;
}

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
  // Required by project lint rule
  locals.security.requireNothing();

  let body: DeleteRequestBody;

  try {
    body = await request.json();
  } catch {
    error(400, 'Invalid request body');
  }

  const { email, deletionType, turnstileToken } = body;

  // ---- Validate input ----
  if (!email || typeof email !== 'string') {
    error(400, 'Email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    error(400, 'Invalid email format');
  }

  if (!['data', 'account'].includes(deletionType)) {
    error(400, 'Invalid deletion type');
  }

  if (!turnstileToken) {
    error(400, 'Captcha verification failed');
  }

  // ---- Verify Turnstile ----
  if (!env.TURNSTILE_SECRET_KEY) {
    error(500, 'Turnstile not configured');
  }

  const ip = getClientAddress();

  const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
      remoteip: ip
    })
  });

  if (!verifyResponse.ok) {
    error(500, 'Captcha verification failed');
  }

  const verification = await verifyResponse.json();

  if (!verification.success) {
    error(400, 'Invalid captcha');
  }

  // ---- Process request ----
  // Future implementation:
  // - send an email verification code
  // - queue a deletion request
  // - store request in database

  console.log('Delete request received', {
    email,
    deletionType,
    ip
  });

  return json({
    success: true
  });
};
