import { error, json } from '@sveltejs/kit';
import { jwtVerify } from 'jose';
import type { KeyObject } from 'node:crypto';
import { createPublicKey } from 'node:crypto';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { ProductActionType } from '$lib/products/index';
import { doProductAction } from '$lib/products/server';
import { DatabaseReads } from '$lib/server/database';

export async function POST({ params, request }) {
  if (!request.headers.get('Authorization')) {
    return error(401, 'Unauthorized');
  }

  const authToken = request.headers.get('Authorization')?.replace('Bearer ', '');

  let jwtData;
  try {
    jwtData = await decryptJwtWithAuth0(authToken ?? '');
  } catch {
    // Signature verification failed
    return error(401, 'Unauthorized');
  }

  const user = await DatabaseReads.users.findMany({
    where: {
      ExternalId: jwtData.payload.sub
    },
    select: {
      Id: true,
      Name: true,
      Email: true,
      WorkflowUserId: true,
      UserRoles: {
        select: {
          OrganizationId: true,
          RoleId: true
        }
      }
    }
  });
  if (user.length !== 1) {
    // Should never happen
    // (unless the user doesn't exist?)
    return error(500, `Internal Server Error`);
  }

  // user[0] is now authenticated. Still need to check authorization
  const projectId = parseInt(params.id);

  const project = await DatabaseReads.projects.findUnique({
    where: {
      Id: projectId
    },
    select: {
      WorkflowProjectUrl: true,
      WorkflowProjectId: true,
      Owner: {
        select: {
          Id: true,
          ExternalId: true
        }
      },
      OrganizationId: true
    }
  });

  if (!project) {
    return new Response(
      JSON.stringify({
        errors: [{ title: `Project id=${projectId} not found` }]
      }),
      {
        status: 404
      }
    );
  }

  if (!project.WorkflowProjectUrl) {
    return new Response(
      JSON.stringify({
        errors: [{ title: `Project id=${projectId}: WorkflowProjectUrl is null` }]
      }),
      {
        status: 404
      }
    );
  }

  const isOwner = user[0].Id === project.Owner.Id;
  if (!isOwner) {
    return error(403, 'Only the project owner can rebuild');
  }

  const products = await DatabaseReads.products.findMany({
    where: { ProjectId: projectId },
    select: {
      Id: true,
      DatePublished: true,
      PublishLink: true,
      WorkflowInstance: { select: { Id: true } }
    }
  });

  // Find eligible products: published & not currently in workflow
  const rebuildableProducts = products.filter(
    (p) => p.DatePublished != null && p.PublishLink != null && !p.WorkflowInstance
  );

  const canRebuild = isOwner && rebuildableProducts.length > 0;
  if (!canRebuild) {
    return error(400, 'Project does not meet rebuild conditions');
  }

  // Trigger rebuild on each eligible product
  for (const product of rebuildableProducts) {
    await doProductAction(product.Id, ProductActionType.Rebuild);
  }

  return json({
    message: `Triggered rebuild for ${rebuildableProducts.length} product(s)`
  });
}

let resolve: CallableFunction = () => {};
const secrets: Promise<Map<string, KeyObject>> = new Promise((r) => (resolve = r));

if (!building) {
  (async () => {
    const res = await fetch(`https://${env.AUTH0_DOMAIN}/.well-known/jwks.json`);
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

    resolve(
      new Map(
        keys.map((key) => [
          key.kid,
          createPublicKey({
            key,
            format: 'jwk'
          })
        ])
      )
    );
  })();
}

async function decryptJwtWithAuth0(jwt: string) {
  return jwtVerify(jwt, async (header) => {
    return (await secrets).get(header.kid!)!;
  });
}
