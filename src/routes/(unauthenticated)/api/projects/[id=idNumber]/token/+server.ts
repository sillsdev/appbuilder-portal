import { json } from '@sveltejs/kit';
import { createAppBuildersError } from '../common';
import { ProductTransitionType, RoleId } from '$lib/prisma';
import { BuildEngine } from '$lib/server/build-engine-api';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';

const TOKEN_USE_HEADER = 'Use';
const TOKEN_USE_UPLOAD = 'Upload';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TOKEN_USE_DOWNLOAD = 'Download';

export async function POST({ params, locals, request }) {
  locals.security.requireApiToken();

  const user = await DatabaseReads.users.findUniqueOrThrow({
    where: { Id: locals.security.userId },
    select: {
      Id: true,
      Name: true,
      Email: true,
      WorkflowUserId: true
    }
  });

  const projectId = parseInt(params.id);

  const tokenUse = request.headers.get(TOKEN_USE_HEADER);

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
  if (!project) return createAppBuildersError(404, `Project id=${projectId} not found`);

  if (!project.WorkflowProjectUrl)
    return createAppBuildersError(404, `Project id=${projectId}: WorkflowProjectUrl is null`);

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
      readOnly = false;
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
    project.WorkflowProjectId,
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
  const products = await DatabaseReads.products.findMany({
    where: { ProjectId: projectId },
    select: { Id: true }
  });

  await DatabaseWrites.productTransitions.createMany(
    {
      data: products.map((p) => ({
        ProductId: p.Id,
        AllowedUserNames: user.Name,
        TransitionType: ProductTransitionType.ProjectAccess,
        InitialState: 'Project ' + use,
        WorkflowUserId: user.WorkflowUserId,
        UserId: user.Id,
        DateTransition: new Date()
      }))
    },
    projectId
  );

  return json({ data: projectToken });
}
