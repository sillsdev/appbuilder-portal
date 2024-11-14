import { error, redirect } from '@sveltejs/kit';

export async function POST({ request }) {
  if (!request.headers.get('Authorization')) {
    return error(401, `Unauthorized`);
  }

  return redirect(
    302,
    `/auth/callback/auth0?code=${request.headers
      .get('Authorization')
      ?.replace('Bearer ', '')}&redirectUrl=/projects/id/token`
  );
}
