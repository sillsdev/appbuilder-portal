import { Job, Worker } from 'bullmq';
import { BullMQ, DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';

export abstract class BullWorker<T, R> {
  public worker: Worker;
  constructor(public queue: string) {
    this.worker = new Worker<T, R>(queue, this.run, {
      connection: {
        host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
      }
    });
  }
  abstract run(job: Job<T, R>): Promise<R>;
}

export class ScriptoriaWorker extends BullWorker<BullMQ.ScriptoriaJob, number> {
  constructor() {
    super('scriptoria');
  }
  async run(job: Job<BullMQ.ScriptoriaJob, number, string>): Promise<number> {
    switch (job.data.type) {
    case BullMQ.ScriptoriaJobType.Test: {
      job.updateProgress(50);
      const time = job.data.time;
      await new Promise((r) => setTimeout(r, 1000 * time));
      job.updateProgress(100);
      return 0;
    }
    case BullMQ.ScriptoriaJobType.ReassignUserTasks: {
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
  }
}
