import type { Prisma } from '@prisma/client';
import { ScriptoriaJobType } from '../BullJobTypes.js';
import { scriptoriaQueue } from '../bullmq.js';
import prisma from '../prisma.js';

/**
 * For a project to be valid:
 * 1. Each of the following must reference a valid relation (HANDLED BY POSTGRESQL)
 *  - OrganizationId => Organizations
 *  - GroupId => Groups
 *  - OwnerId => Users
 * 2. This project's group must have the same organization as the project itself
 *  - Group.OwnerId === OrganizationId
 * 3. The project's owner must be in the project's organization
 *  - Owner.OrganizationMemberships[].OrganizationId includes OrganizationId
 */

export async function create(projectData: Prisma.ProjectsCreateArgs['data']): Promise<boolean> {
  if (
    !validateProjectBase(
      projectData.OrganizationId ?? projectData.Organization.connect!.Id!,
      projectData.GroupId ?? projectData.Group.connect!.Id!,
      projectData.OwnerId ?? projectData.Owner.connect!.Id!
    )
  )
    return false;

  // No additional verification steps

  try {
    await prisma.projects.create({
      data: projectData
    });
  } catch (e) {
    return false;
  }
  return true;
}

// Errors if projectData uses create or connectOrCreate
// instead of using connect or setting the id directly
export async function update(
  id: number,
  projectData: Prisma.ProjectsUpdateArgs['data']
): Promise<boolean> {
  // There are cases where a db lookup is not necessary to verify that it will
  // be a legal relation after the update, such as if none of the relevant
  // columns are changed, but for simplicity we just lookup once anyway
  const existing = await prisma.projects.findUnique({
    where: {
      Id: id
    }
  });
  const orgId =
    (projectData.OrganizationId as number) ??
    projectData.Organization?.connect?.Id ??
    existing?.OrganizationId;
  const groupId =
    (projectData.GroupId as number) ?? projectData.Group?.connect?.Id ?? existing?.GroupId;
  const ownerId = (projectData.OwnerId as number) ?? projectData.Owner?.connect?.Id;
  if (ownerId && ownerId !== existing?.OwnerId) {
    scriptoriaQueue.add(ScriptoriaJobType.ReassignUserTasks, {
      type: ScriptoriaJobType.ReassignUserTasks,
      projectId: id
    });
  }
  if (!validateProjectBase(orgId, groupId, ownerId)) return false;

  // No additional verification steps

  try {
    await prisma.projects.update({
      where: {
        Id: id
      },
      data: projectData
    });
  } catch (e) {
    return false;
  }
  return true;
}

// async function deleteProject(id: number): Promise<never> {
//   throw new Error('Should not be deleting a project, only archiving');
// }
// export { deleteProject as delete };

async function validateProjectBase(orgId: number, groupId: number, ownerId: number) {
  // Each of the criteria for a valid project just needs to checked if
  // the relevant data is supplied. If it isn't, then this is an update
  // and the data was valid already, or PostgreSQL will catch it
  return (
    orgId === (await prisma.groups.findUnique({ where: { Id: groupId } }))?.OwnerId &&
    (
      await prisma.organizationMemberships.findMany({
        where: { UserId: ownerId, OrganizationId: orgId }
      })
    ).length > 0
  );
}
