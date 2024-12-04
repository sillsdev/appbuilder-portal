import type { Prisma } from '@prisma/client';
import { BullMQ, Queues } from '../index.js';
import prisma from '../prisma.js';
import type { RequirePrimitive } from './utility.js';

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

export async function create(
  projectData: RequirePrimitive<Prisma.ProjectsUncheckedCreateInput>
): Promise<boolean | number> {
  if (
    !(await validateProjectBase(
      projectData.OrganizationId,
      projectData.GroupId,
      projectData.OwnerId
    ))
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

export async function update(
  id: number,
  projectData: RequirePrimitive<Prisma.ProjectsUncheckedUpdateInput>
): Promise<boolean> {
  // There are cases where a db lookup is not necessary to verify that it will
  // be a legal relation after the update, such as if none of the relevant
  // columns are changed, but for simplicity we just lookup once anyway
  const existing = await prisma.projects.findUnique({
    where: {
      Id: id
    }
  });
  const orgId = projectData.OrganizationId ?? existing!.OrganizationId;
  const groupId = projectData.GroupId ?? existing!.GroupId;
  const ownerId = projectData.OwnerId ?? existing!.OwnerId;
  if (!(await validateProjectBase(orgId, groupId, ownerId))) return false;

  // No additional verification steps

  try {
    await prisma.projects.update({
      where: {
        Id: id
      },
      data: projectData
    });
    // If the owner has changed, we need to reassign all the user tasks related to this project
    if (ownerId && ownerId !== existing?.OwnerId) {
      Queues.UserTasks.add(`Reassign tasks for Project #${id} (New Owner)`, {
        type: BullMQ.JobType.UserTasks_Modify,
        scope: 'Project',
        projectId: id,
        operation: {
          type: BullMQ.UserTasks.OpType.Reassign,
          userMapping: [
            { from: existing.OwnerId, to: ownerId }
          ]
        }
      });
    }
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
