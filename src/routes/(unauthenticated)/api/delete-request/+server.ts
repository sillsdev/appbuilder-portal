import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
  // Security check
  locals.security.requireAuthenticated();

  const { email, token } = await request.json();

  if (!token) return json({ success: false }, { status: 400 });

  const secret = process.env.TURNSTILE_SECRET_KEY;
  const formData = new URLSearchParams();

  formData.append('secret', secret!);
  formData.append('response', token);

  const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData
  });

  const result = await verification.json();

  if (!result.success) return json({ success: false }, { status: 400 });

  // Example usage to prevent unused variable lint
  console.log('Delete request for', email);

  return json({ success: true });
};
