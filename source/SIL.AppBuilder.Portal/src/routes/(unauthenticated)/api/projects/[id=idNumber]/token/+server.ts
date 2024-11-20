import { jwtVerify } from 'jose';
import { createPublicKey } from 'node:crypto';
import { prisma, BuildEngine, DatabaseWrites } from 'sil.appbuilder.portal.common';
import { RoleId, ProductTransitionType } from 'sil.appbuilder.portal.common/prisma';
import { error, json } from '@sveltejs/kit';

const TOKEN_USE_HEADER = 'Use';
const TOKEN_USE_UPLOAD = 'Upload';
const TOKEN_USE_DOWNLOAD = 'Download';

export async function POST({ params, request, fetch }) {
  if (!request.headers.get('Authorization')) {
    return error(401, `Unauthorized`);
  }

  const authToken = request.headers.get('Authorization')?.replace('Bearer ', '');

  let jwtData;
  try {
    jwtData = await decryptJwtWithAuth0(authToken ?? '');
  } catch (e) {
    // Signature verification failed
    return error(401, `Unauthorized`);
  }
  const user = await prisma.users.findMany({
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

  const tokenUse = request.headers.get(TOKEN_USE_HEADER);

  const project = await prisma.projects.findUnique({
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
        errors: [
          {
            error: `Project id=${projectId} not found`
          }
        ]
      }),
      {
        status: 404
      }
    );
  }

  if (!project.WorkflowProjectUrl) {
    return new Response(
      JSON.stringify({
        errors: [
          {
            error: `Project id=${projectId}: WorkflowProjectUrl is null`
          }
        ]
      }),
      {
        status: 404
      }
    );
  }

  // Check ownership
  let readOnly: boolean | null = null;
  if (user[0].Id === project.Owner.Id) {
    readOnly = false;
  }

  // Check roles
  if (readOnly === null) {
    user[0].UserRoles.every(({ OrganizationId: org, RoleId: role }) => {
      if (
        role === RoleId.SuperAdmin ||
        (org === project.OrganizationId && role === RoleId.OrgAdmin)
      ) {
        readOnly = true;
        return false; // This works like a `break;`
      }
    });
  }

  // Check authors
  if (readOnly === null) {
    const authors = await prisma.authors.findMany({
      where: {
        ProjectId: projectId
      },
      select: {
        UserId: true
      }
    });
    if (authors.find((a) => a.UserId === user[0].Id)) {
      // TODO: Kalaam now wants authors to be able to update at any time.  In the future, we can add a setting on the author to whether they are a restricted author or not. I don't have time to add the UI at the moment.
      //readOnly = !author.CanUpdate;
      readOnly = false;
    }
  }

  if (readOnly === null) {
    return new Response(
      JSON.stringify({
        errors: [
          {
            error: `Project id=${projectId}, user='${user[0].Name}' with email='${user[0].Email}' does not have permission to access`
          }
        ]
      }),
      {
        status: 403
      }
    );
  }

  if (tokenUse && tokenUse === TOKEN_USE_UPLOAD && readOnly) {
    return new Response(
      JSON.stringify({
        errors: [
          {
            error: `Project id=${projectId}, user='${user[0].Name}' with email='${user[0].Email}' does not have permission to Upload`
          }
        ]
      }),
      {
        status: 403
      }
    );
  }

  const tokenResult = await BuildEngine.Requests.getProjectAccessToken(
    { type: 'query', organizationId: project.OrganizationId },
    project.WorkflowProjectId,
    {
      name: project.Owner.ExternalId ?? '',
      ReadOnly: readOnly
    }
  );

  if (!tokenResult || tokenResult.responseType === 'error') {
    return new Response(
      JSON.stringify({
        errors: [
          {
            error: `Project id=${projectId}: GetProjectToken returned null`
          }
        ]
      }),
      {
        status: 400
      }
    );
  }
  if (tokenResult.SecretAccessKey == null) {
    return new Response(
      JSON.stringify({
        errors: [
          {
            error: `Project id=${projectId}: Token.SecretAccessKey is null`
          }
        ]
      }),
      {
        status: 400
      }
    );
  }
  const projectToken = {
    type: 'project-tokens',
    attributes: {
      id: projectId,
      url: project.WorkflowProjectUrl,
      'session-token': tokenResult.SessionToken,
      'secret-access-key': tokenResult.SecretAccessKey,
      'access-key-id': tokenResult.AccessKeyId,
      expiration: tokenResult.Expiration,
      region: tokenResult.Region,
      'read-only': tokenResult.ReadOnly
    }
  };

  let use = readOnly ? 'ReadOnly Access' : 'ReadWrite Access';

  if (tokenUse) {
    use = tokenUse;
  }
  const products = await prisma.products.findMany({
    where: { ProjectId: projectId },
    select: { Id: true }
  });

  await DatabaseWrites.productTransitions.createMany({
    data: products.map((p) => ({
      ProductId: p.Id,
      AllowedUserNames: user[0].Name,
      TransitionType: ProductTransitionType.ProjectAccess,
      InitialState: 'Project ' + use,
      WorkflowUserId: user[0].WorkflowUserId,
      DateTransition: new Date()
    }))
  });

  return json({ data: projectToken });
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
