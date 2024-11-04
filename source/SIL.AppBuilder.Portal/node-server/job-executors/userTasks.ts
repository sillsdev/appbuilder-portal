import { Prisma } from '@prisma/client';
import { Job } from 'bullmq';
import { BullMQ, DatabaseWrites, prisma, Workflow } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { ActionType } from 'sil.appbuilder.portal.common/workflow';

export async function modify(job: Job<BullMQ.UserTasks.Modify>): Promise<unknown> {
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
  let deletedCount = 0;

  // Clear PreExecuteEntries
  await DatabaseWrites.productTransitions.deleteMany({
    where: {
      WorkflowUserId: null,
      ProductId: { in: productIds },
      DateTransition: null
    }
  });

  job.updateProgress(20);

  let mapping: {
    from: string;
    to: string;
    count: number;
  }[] = [];

  if (job.data.operation.type === BullMQ.UserTasks.OpType.Reassign) {
    const timestamp = new Date();

    mapping = await Promise.all(
      job.data.operation.userMapping.map(async (u) => ({
        from: (
          await prisma.users.findUnique({ where: { Id: u.from }, select: { Name: true } })
        ).Name,
        to: (await prisma.users.findUnique({ where: { Id: u.to }, select: { Name: true } })).Name,
        count: (
          await DatabaseWrites.userTasks.updateMany({
            where: {
              UserId: u.from
            },
            data: {
              UserId: u.to,
              DateUpdated: timestamp
            }
          })
        ).count
      }))
    );
    job.updateProgress(40);
    for (let i = 0; i < products.length; i++) {
      const snap = await Workflow.getSnapshot(products[i].Id);
      job.updateProgress(40 + ((i + 0.2) * 40) / products.length);
      await DatabaseWrites.productTransitions.createMany({
        data: await Workflow.transitionEntriesFromState(snap.state, products[i].Id, snap.config)
      });
      job.updateProgress(40 + ((i + 1) * 40) / products.length);
    }
    job.updateProgress(80);
    // Just in case the user had already existing tasks before the reassignment
    createdTasks = await prisma.userTasks.findMany({
      where: {
        UserId: { in: job.data.operation.userMapping.map((u) => u.to) },
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
      const res = await DatabaseWrites.userTasks.deleteMany({
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
                            .flatMap(([role, uids]) => uids)
                        )
                      )
              }
        }
      });
      deletedCount = res.count;
      job.updateProgress(job.data.operation.type === BullMQ.UserTasks.OpType.Delete ? 90 : 40);
    }
    if (job.data.operation.type !== BullMQ.UserTasks.OpType.Delete) {
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        // Create tasks for all users that could perform this activity
        const snap = await Workflow.getSnapshot(product.Id);
        const roles = (
          Workflow.availableTransitionsFromName(snap.state, snap.config)
            .filter((t) => t[0].meta.type === ActionType.User)
            .map((t) => t[0].meta.user) as RoleId[]
        ).filter((r) => job.data.operation.by !== 'Role' || job.data.operation.roles.includes(r));
        job.updateProgress(40 + ((i + 0.33) * 40) / products.length);
        createdTasks = Array.from(
          new Set(
            Array.from(allUsers.entries())
              .filter(([role, uids]) => roles.includes(role))
              .flatMap(([role, uids]) => uids)
          )
        )
          .filter((u) => job.data.operation.by !== 'UserId' || job.data.operation.users.includes(u))
          .map((user) => ({
            UserId: user,
            ProductId: product.Id,
            ActivityName: snap.state,
            Status: snap.state,
            Comment: job.data.comment
          }));
        await DatabaseWrites.userTasks.createMany({
          data: createdTasks
        });
        job.updateProgress(40 + ((i + 0.67) * 40) / products.length);
        await DatabaseWrites.productTransitions.createMany({
          data: await Workflow.transitionEntriesFromState(snap.state, products[i].Id, snap.config)
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
  return {
    deleted: deletedCount,
    createdOrUpdated: { count: createdTasks.length, tasks: createdTasks },
    reassignMap: mapping
  };
}
