import { BullMQ, prisma, DatabaseWrites } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { Job } from 'bullmq';
import { ScriptoriaJobExecutor } from './base.js';

export class Reassign extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.UserTasks_Reassign> {
  async execute(job: Job<BullMQ.UserTasks.Reassign, number, string>): Promise<number> {
    // TODO: Noop
    // Should
    // Clear preexecuteentries (product transition steps)
    // Remove relevant user tasks
    // Create new user tasks (send notifications)
    // Recreate preexecute entries
    const products = await prisma.products.findMany({
      where: {
        ProjectId: job.data.projectId
      },
      include: {
        ProductTransitions: true
      }
    });
    for (const product of products) {
      // Clear PreExecuteEntries
      await DatabaseWrites.productTransitions.deleteMany({
        where: {
          WorkflowUserId: null,
          ProductId: product.Id,
          DateTransition: null
        }
      });
      // Clear existing UserTasks
      await DatabaseWrites.userTasks.deleteMany({
        where: {
          ProductId: product.Id
        }
      });
      // Create tasks for all users that could perform this activity
      // TODO: this comes from dwkit GetAllActorsFor(Direct|Reverse)CommandTransitions
      const organizationId = (
        await prisma.projects.findUnique({
          where: {
            Id: job.data.projectId
          },
          include: {
            Organization: true
          }
        })
      ).OrganizationId;
      // All users that own the project or are org admins
      const allUsersWithAction = await prisma.users.findMany({
        where: {
          OR: [
            {
              UserRoles: {
                some: {
                  OrganizationId: organizationId,
                  RoleId: RoleId.OrgAdmin
                }
              }
            },
            {
              Projects: {
                some: {
                  Id: job.data.projectId
                }
              }
            }
          ]
        }
      });
      // TODO: DWKit: Need ActivityName and Status from dwkit implementation
      const createdTasks = allUsersWithAction.map((user) => ({
        UserId: user.Id,
        ProductId: product.Id,
        ActivityName: null,
        Status: null
      }));
      await DatabaseWrites.userTasks.createMany({
        data: createdTasks
      });
      for (const task of createdTasks) {
        // Send notification for the new task
        // TODO
        // sendNotification(task);
      }
      // TODO: DWKit: CreatePreExecuteEntries
    }

    return (
      await prisma.userTasks.findMany({
        where: {
          Product: {
            ProjectId: job.data.projectId
          }
        }
      })
    ).length;
  }
}
