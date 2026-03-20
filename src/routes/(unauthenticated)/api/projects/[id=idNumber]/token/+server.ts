import { json } from '@sveltejs/kit';
import { createAppBuildersError } from '../common';
import { ProjectActionType, RoleId } from '$lib/prisma';
import { BuildEngine } from '$lib/server/build-engine-api';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';

const TOKEN_USE_HEADER = 'Use';
const TOKEN_USE_UPLOAD = 'Upload';
const TOKEN_USE_STATUS = 'Status';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TOKEN_USE_DOWNLOAD = 'Download';

export async function POST({ params, locals, request }) {
  try {
    locals.security.requireApiToken();
  } catch {
    return createAppBuildersError(401, 'Login timed out');
  }

  const user = await DatabaseReads.users.findUniqueOrThrow({
    where: { Id: locals.security.userId },
    select: {
      Id: true,
      Name: true,
      Email: true
    }
  });

  const projectId = parseInt(params.id);

  const tokenUse = request.headers.get(TOKEN_USE_HEADER);

  const project = await DatabaseReads.projects.findUnique({
    where: {
      Id: projectId
    },
    select: {
      RepositoryUrl: true,
      BuildEngineProjectId: true,
      Owner: {
        select: {
          Id: true,
          ExternalId: true
        }
      },
      Authors: {
        select: {
          UserId: true
        }
      },
      OrganizationId: true
    }
  });
  if (!project) return createAppBuildersError(404, `Project id=${projectId} not found`);

  if (!project.RepositoryUrl)
    return createAppBuildersError(404, `Project id=${projectId}: RepositoryUrl is null`);

  // Check ownership
  let readOnly: boolean | null = null;
  if (locals.security.userId === project.Owner.Id) {
    readOnly = false;
  }

  // Check roles
  if (readOnly === null) {
    try {
      locals.security.requireAdminOfOrg(project.OrganizationId);
      readOnly = false;
    } catch {
      /* empty */
    }
  }

  // Check authors
  if (readOnly === null) {
    try {
      locals.security.requireHasRole(project.OrganizationId, RoleId.Author, false);
      // ISSUE: #1101 Kalaam now wants authors to be able to update at any time.  In the future, we can add a setting on the author to whether they are a restricted author or not. I don't have time to add the UI at the moment.
      //readOnly = !author.CanUpdate;
      if (project.Authors.some(({ UserId }) => UserId === locals.security.userId)) {
        readOnly = false;
      }
    } catch {
      /* empty */
    }
  }

  if (readOnly === null)
    return createAppBuildersError(
      403,
      `Project id=${projectId}, user='${user.Name}' with email='${user.Email}' does not have permission to access`
    );

  if (tokenUse && tokenUse === TOKEN_USE_UPLOAD && readOnly)
    return createAppBuildersError(
      403,
      `Project id=${projectId}, user='${user.Name}' with email='${user.Email}' does not have permission to Upload`
    );

  const tokenResult = await BuildEngine.Requests.getProjectAccessToken(
    { type: 'query', organizationId: project.OrganizationId },
    project.BuildEngineProjectId,
    {
      name: project.Owner.ExternalId ?? '',
      ReadOnly: readOnly
    }
  );

  if (!tokenResult || tokenResult.responseType === 'error')
    return createAppBuildersError(400, `Project id=${projectId}: GetProjectToken returned null`);
  if (tokenResult.SecretAccessKey == null)
    return createAppBuildersError(400, `Project id=${projectId}: Token.SecretAccessKey is null`);
  const projectToken = {
    type: 'project-tokens',
    attributes: {
      id: projectId,
      url: project.RepositoryUrl,
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

  if (use !== TOKEN_USE_STATUS) {
    await DatabaseWrites.projectActions.create({
      data: {
        ProjectId: projectId,
        UserId: user.Id,
        ActionType: ProjectActionType.Access,
        Action: use
      }
    });
  }

  return json({ data: projectToken });
}
