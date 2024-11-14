import { error } from '@sveltejs/kit';
import { jwtVerify } from 'jose';
import { createPublicKey } from 'node:crypto';
import { prisma } from 'sil.appbuilder.portal.common';

export async function POST({ params, request, fetch }) {
  if (!request.headers.get('Authorization')) {
    return error(401, `Unauthorized`);
  }

  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  let jwtData;
  try {
    jwtData = await decryptJwtWithAuth0(token ?? '');
  } catch (e) {
    // Signature verification failed
    return error(401, `Unauthorized`);
  }
  const user = await prisma.users.findMany({
    where: {
      ExternalId: jwtData.payload.sub
    }
  });
  if (user.length !== 1)
    // Should never happen
    // (unless the user doesn't exist?)
    return error(500, `Internal Server Error`);

  // user[0] is now authenticated. Still need to check authorization
  // ...
  console.log(user[0].Name, 'is authenticated');

  return new Response();
}
const secrets = (async () => {
  const res = await fetch(
    'https://' + import.meta.env.VITE_AUTH0_DOMAIN + '/.well-known/jwks.json'
  );
  const keys: {
    kty: string;
    use: string;
    n: string;
    e: string;
    kid: string;
    x5t: string;
    x5c: string[];
    alg: string;
  }[] = (await res.json()).keys;
  return new Map(
    keys.map((key) => [
      key.kid,
      createPublicKey({
        key,
        format: 'jwk'
      })
    ])
  );
})();
async function decryptJwtWithAuth0(jwt: string) {
  return jwtVerify(jwt, async (header, token) => {
    return (await secrets).get(header.kid!)!;
  });
}
