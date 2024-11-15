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
    return error(404, `Project id=${projectId} not found`);
  }

  if (!project.WorkflowProjectUrl) {
    return error(404, `Project id=${projectId}: WorkflowProjectUrl is null`);
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
    return error(
      403,
      `Project id=${projectId}, user='${user[0].Name}' with email='${user[0].Email}' does not have permission to access`
    );
  }

  if (tokenUse && tokenUse === TOKEN_USE_UPLOAD && readOnly) {
    return error(
      403,
      `Project id=${projectId}, user='${user[0].Name}' with email='${user[0].Email}' does not have permission to Upload`
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
    return error(400, `Project id=${projectId}: GetProjectToken returned null`);
  }
  if (tokenResult.SecretAccessKey == null) {
    return error(400, `Project id=${projectId}: Token.SecretAccessKey is null`);
  }
  const projectToken = {
    Id: projectId,
    Url: project.WorkflowProjectUrl,
    ...tokenResult
  };

  console.log(JSON.stringify(projectToken, null, 4)); // TODO: Remove

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
      AllowedUserNames: '',
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
