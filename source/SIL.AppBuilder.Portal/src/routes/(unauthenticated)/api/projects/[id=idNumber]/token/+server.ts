import { error } from '@sveltejs/kit';
import { encode, getToken } from'@auth/core/jwt';
import { jwtVerify } from 'jose';

export async function POST({ params, request, fetch }) {
  if (!request.headers.get('Authorization')) {
    return error(401, `Unauthorized`);
  }

  const token = await getToken({ req: request, raw: true, salt: '', secret: [] });

  console.log(token);

  console.log(jwtVerify(token));

  console.log(await encode({ token, secret: import.meta.env.VITE_AUTH0_CLIENT_SECRET, salt: ''}))

  
  return new Response();
  const res = await fetch(`/projects/${params.id}/token`, {
    method: 'POST',
    headers: {
      ...Object.fromEntries(request.headers.entries()),
      Cookie: `authjs.session-token=${request.headers
        .get('Authorization')
        ?.replace('Bearer ', '')}`
    }
  });

  console.log(res);

  return res;
}
