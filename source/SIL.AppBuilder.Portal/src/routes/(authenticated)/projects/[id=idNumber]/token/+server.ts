import { prisma, BuildEngine, DatabaseWrites } from 'sil.appbuilder.portal.common';
import { RoleId, ProductTransitionType } from 'sil.appbuilder.portal.common/prisma';
import { error, json } from '@sveltejs/kit';

const TOKEN_USE_HEADER = 'Use';
const TOKEN_USE_UPLOAD = 'Upload';
const TOKEN_USE_DOWNLOAD = 'Download';

export async function POST({ params, request, locals }) {
  const projectId = parseInt(params.id);
  const session = await locals.auth();

  console.log(JSON.stringify(session, null, 4));

  if (!session) {
    return error(401, `Unauthorized`);
  }

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
  if (session.user.userId === project.Owner.Id) {
    readOnly = false;
  }

  // Check roles
  if (readOnly === null) {
    session.user.roles.every(([org, role]) => {
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
    if (authors.find((a) => a.UserId === session.user.userId)) {
      // TODO: Kalaam now wants authors to be able to update at any time.  In the future, we can add a setting on the author to whether they are a restricted author or not. I don't have time to add the UI at the moment.
      //readOnly = !author.CanUpdate;
      readOnly = false;
    }
  }

  if (readOnly === null) {
    return error(
      403,
      `Project id=${projectId}, user='${session.user.name}' with email='${session.user.email}' does not have permission to access`
    );
  }

  if (tokenUse && tokenUse === TOKEN_USE_UPLOAD && readOnly) {
    return error(
      403,
      `Project id=${projectId}, user='${session.user.name}' with email='${session.user.email}' does not have permission to Upload`
    );
  }

  const token = await BuildEngine.Requests.getProjectAccessToken(
    { type: 'query', organizationId: project.OrganizationId },
    project.WorkflowProjectId,
    {
      name: project.Owner.ExternalId ?? '',
      ReadOnly: readOnly
    }
  );

  console.log(JSON.stringify(token, null, 4)); // TODO: remove

  if (!token || token.responseType === 'error') {
    return error(400, `Project id=${projectId}: GetProjectToken returned null`);
  }
  if (token.SecretAccessKey == null) {
    return error(400, `Project id=${projectId}: Token.SecretAccessKey is null`);
  }
  const projectToken = {
    Id: projectId,
    Url: project.WorkflowProjectUrl,
    ...token
  };

  let use = readOnly ? 'ReadOnly Access' : 'ReadWrite Access';

  if (tokenUse) {
    use = tokenUse;
  }
  const products = await prisma.products.findMany({
    where: { ProjectId: projectId },
    select: { Id: true }
  });

  const workflowUserId = (
    await prisma.users.findUnique({
      where: { Id: session.user.userId },
      select: { WorkflowUserId: true }
    })
  )?.WorkflowUserId;

  await DatabaseWrites.productTransitions.createMany({
    data: products.map((p) => ({
      ProductId: p.Id,
      AllowedUserNames: '',
      TransitionType: ProductTransitionType.ProjectAccess,
      InitialState: 'Project ' + use,
      WorkflowUserId: workflowUserId,
      DateTransition: new Date()
    }))
  });

  return json({ data: projectToken});
}
