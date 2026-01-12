import { error } from '@sveltejs/kit';
import { createHash } from 'node:crypto';
import * as v from 'valibot';
import { getAuthConnection } from '$lib/server/bullmq/queues';

/**
 * Returns JSON object with API token (`id_token`), adjusted expiry time (`expires_in`), and empty `access_token`
 *
 * Required Body Params:
 * code: code received by querying /api/auth/token
 * verify: string whose hash had been used as the challenge for /api/auth/token
 */
export async function POST({ locals, request }) {
  locals.security.requireNothing();

  const body = v.safeParse(
    v.object({
      code: v.pipe(v.string(), v.uuid()),
      verify: v.string()
    }),
    await request.json()
  );

  if (body.success) {
    // get cached challenge and token
    const [challenge, token] = await getAuthConnection().mget(
      `code:${body.output.code}`,
      `token:${body.output.code}`
    );
    if (!challenge || !token) error(400, 'Invalid or expired code');

    try {
      //immediately invalidate
      await getAuthConnection()
        .pipeline()
        .del(`code:${body.output.code}`)
        .del(`token:${body.output.code}`)
        .exec();
    } catch {
      /* empty */
    }

    // verify challenge
    const hash = createHash('sha256');
    hash.update(body.output.verify);
    // client uses base64url encoder without padding
    const digest = hash.digest('base64url').replace(/=+$/, '');

    if (digest !== challenge) error(400, 'Failed Verification');

    return new Response(
      JSON.stringify({
        access_token: '',
        id_token: token,
        expires_in: (24 * 60 - 5) * 60 // 24 hrs - up to 5 minutes for code expiration
      })
    );
  } else {
    error(400, 'Bad Request');
  }
}
