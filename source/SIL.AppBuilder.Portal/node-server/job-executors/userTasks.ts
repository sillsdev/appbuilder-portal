import { BullMQ, prisma, DatabaseWrites, Workflow } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { Job } from 'bullmq';
import { ScriptoriaJobExecutor } from './base.js';
import { Prisma } from '@prisma/client';
import { ActionType } from 'sil.appbuilder.portal.common/workflow';

export class Modify extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.UserTasks_Modify> {
  async execute(job: Job<BullMQ.UserTasks.Modify, number, string>): Promise<number> {
    const products = await prisma.products.findMany({
      where: {
        Id: job.data.scope === 'Product' ? job.data.productId : undefined,
        ProjectId: job.data.scope === 'Project' ? job.data.projectId : undefined
      },
      select: {
        Id: true,
        ProjectId: true,
        ProductTransitions: true
      }
    });
    job.updateProgress(10);
    const projectId = job.data.scope === 'Project' ? job.data.projectId : products[0].ProjectId;

    const productIds = products.map((p) => p.Id);

    let createdTasks: Prisma.UserTasksCreateManyInput[] = [];

    // Clear PreExecuteEntries
    await DatabaseWrites.productTransitions.deleteMany({
      where: {
        WorkflowUserId: null,
        ProductId: { in: productIds },
        DateTransition: null
      }
    });

    job.updateProgress(20);

    if (job.data.operation.type === BullMQ.UserTasks.OpType.Reassign) {
      const from = job.data.operation.userMapping.map((u) => u.from);
      const to = job.data.operation.userMapping.map((u) => u.to);

      const timestamp = new Date();

      await Promise.all(
        from.map((u, i) =>
          DatabaseWrites.userTasks.updateMany({
            where: {
              UserId: u
            },
            data: {
              UserId: to[i],
              DateUpdated: timestamp
            }
          })
        )
      );
      job.updateProgress(40);
      for (let i = 0; i < products.length; i++) {
        const snap = await Workflow.getSnapshot(products[i].Id);
        job.updateProgress(40 + ((i + 0.2) * 40) / products.length);
        await DatabaseWrites.productTransitions.createMany({
          data: await Workflow.transitionEntriesFromState(snap.value, products[i].Id, snap.context)
        });
        job.updateProgress(40 + ((i + 1) * 40) / products.length);
      }
      job.updateProgress(80);
      // Just in case the user had already existing tasks before the reassignment
      createdTasks = await prisma.userTasks.findMany({
        where: {
          UserId: { in: to },
          DateUpdated: {
            gte: timestamp
          }
        }
      });
      job.updateProgress(90);
    } else {
      job.updateProgress(25);
      const allUsers = await DatabaseWrites.userRoles.allUsersByRole(projectId);
      job.updateProgress(30);
      if (job.data.operation.type !== BullMQ.UserTasks.OpType.Create) {
        // Clear existing UserTasks
        await DatabaseWrites.userTasks.deleteMany({
          where: {
            ProductId: { in: productIds },
            UserId:
              job.data.operation.by === 'All' ||
              job.data.operation.type === BullMQ.UserTasks.OpType.Update
                ? undefined
                : {
                    in:
                      job.data.operation.by === 'UserId'
                        ? job.data.operation.users
                        : Array.from(
                            new Set(
                              Array.from(allUsers.entries())
                                .filter(
                                  ([role, uids]) =>
                                    job.data.operation.by === 'Role' &&
                                    job.data.operation.roles.includes(role)
                                )
                                .map(([role, uids]) => uids)
                                .reduce((p, c) => p.concat(c), [])
                            )
                          )
                  }
          }
        });
        if (job.data.operation.type === BullMQ.UserTasks.OpType.Delete) {
          job.updateProgress(90);
        } else {
          job.updateProgress(40);
        }
      }
      if (job.data.operation.type !== BullMQ.UserTasks.OpType.Delete) {
        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          // Create tasks for all users that could perform this activity
          const snap = await Workflow.getSnapshot(product.Id);
          const roles = (
            Workflow.availableTransitionsFromName(snap.value, snap.context)
              .filter((t) => t[0].meta.type === ActionType.User)
              .map((t) => t[0].meta.user) as RoleId[]
          ).filter((r) => job.data.operation.by !== 'Role' || job.data.operation.roles.includes(r));
          job.updateProgress(40 + ((i + 0.33) * 40) / products.length);
          const timestamp = new Date();
          createdTasks = Array.from(
            new Set(
              Array.from(allUsers.entries())
                .filter(([role, uids]) => roles.includes(role))
                .map(([role, uids]) => uids)
                .reduce((p, c) => p.concat(c), [])
            )
          )
            .filter(
              (u) => job.data.operation.by !== 'UserId' || job.data.operation.users.includes(u)
            )
            .map((user) => ({
              UserId: user,
              ProductId: product.Id,
              ActivityName: snap.value,
              Status: snap.value,
              Comment: job.data.comment,
              DateCreated: timestamp,
              DateUpdated: timestamp
            }));
          await DatabaseWrites.userTasks.createMany({
            data: createdTasks
          });
          job.updateProgress(40 + ((i + 0.67) * 40) / products.length);
          await DatabaseWrites.productTransitions.createMany({
            data: await Workflow.transitionEntriesFromState(
              snap.value,
              products[i].Id,
              snap.context
            )
          });
          job.updateProgress(40 + ((i + 1) * 40) / products.length);
        }
        job.updateProgress(80);
      }
    }

    for (const task of createdTasks) {
      // TODO: Send notification for the new task
      // sendNotification(task);
    }
    job.updateProgress(100);
    return createdTasks.length;
  }
}
