import type { Prisma } from '@prisma/client';
import type { Job } from 'bullmq';
import { BullMQ, getQueues } from '../bullmq';
import { DatabaseReads, DatabaseWrites } from '../database';
import { Workflow } from '../workflow';
import type { RoleId } from '$lib/prisma';
import { ActionType } from '$lib/workflowTypes';

export async function modify(job: Job<BullMQ.UserTasks.Modify>): Promise<unknown> {
  const products = await DatabaseReads.products.findMany({
    where: {
      Id: job.data.scope === 'Product' ? job.data.productId : undefined,
      ProjectId: job.data.scope === 'Project' ? job.data.projectId : undefined,
      WorkflowInstance:
        // WorkflowInstance can be null if deleting user tasks
        job.data.operation.type !== BullMQ.UserTasks.OpType.Delete ? { isNot: null } : undefined
    },
    select: {
      Id: true,
      ProjectId: true
    }
  });
  job.updateProgress(10);
  const projectId = job.data.scope === 'Project' ? job.data.projectId : products[0].ProjectId;

  const project = await DatabaseReads.projects.findUniqueOrThrow({
    where: { Id: projectId },
    select: { DateArchived: true, _count: { select: { Reviewers: true, Authors: true } } }
  });

  const productIds = products.map((p) => p.Id);

  let createdTasks: Prisma.UserTasksCreateManyInput[] = [];
  let deletedCount = 0;

  // Clear PreExecuteEntries
  if (!project.DateArchived) {
    await DatabaseWrites.productTransitions.deleteMany(
      {
        where: {
          WorkflowUserId: null,
          UserId: null,
          ProductId: { in: productIds },
          DateTransition: null
        }
      },
      projectId
    );
  }
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
          await DatabaseReads.users.findUniqueOrThrow({
            where: { Id: u.from },
            select: { Name: true }
          })
        ).Name!,
        to: (
          await DatabaseReads.users.findUniqueOrThrow({
            where: { Id: u.to },
            select: { Name: true }
          })
        ).Name!,
        count: (
          await DatabaseWrites.userTasks.updateMany({
            where: {
              UserId: u.from,
              ProductId: { in: productIds }
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
      const snap = (await Workflow.getSnapshot(products[i].Id))!;
      job.updateProgress(40 + ((i + 0.2) * 40) / products.length);
      await DatabaseWrites.productTransitions.createMany(
        {
          data: await Workflow.transitionEntriesFromState(snap.state, products[i].Id, {
            ...snap.config,
            productId: products[i].Id,
            hasAuthors: !!project._count.Authors,
            hasReviewers: !!project._count.Reviewers
          })
        },
        products[i].ProjectId
      );
      job.updateProgress(40 + ((i + 1) * 40) / products.length);
    }
    job.updateProgress(80);
    // Just in case the user had already existing tasks before the reassignment
    createdTasks = await DatabaseReads.userTasks.findMany({
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
    const allUsers = await DatabaseWrites.userRoles.allUsersByRole(
      projectId,
      job.data.operation.roles
    );
    job.updateProgress(30);
    if (job.data.operation.type !== BullMQ.UserTasks.OpType.Create) {
      // Clear existing UserTasks
      const res = await DatabaseWrites.userTasks.deleteMany({
        where: {
          ProductId: { in: productIds },
          UserId:
            !(job.data.operation.users || job.data.operation.roles) ||
            job.data.operation.type === BullMQ.UserTasks.OpType.Update
              ? undefined
              : {
                  in:
                    job.data.operation.users ??
                    Array.from(
                      new Set(Object.entries(allUsers).map(([user, roles]) => parseInt(user)))
                    )
                },
          Role: job.data.operation.roles ? { in: job.data.operation.roles } : undefined
        }
      });
      deletedCount = res.count;
      job.updateProgress(job.data.operation.type === BullMQ.UserTasks.OpType.Delete ? 90 : 40);
    }
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const snap = await Workflow.getSnapshot(product.Id);
      if (snap) {
        // Create tasks for all users that could perform this activity
        if (!project.DateArchived && job.data.operation.type !== BullMQ.UserTasks.OpType.Delete) {
          const roleSet = new Set(
            (
              Workflow.availableTransitionsFromName(snap.state, {
                ...snap.config,
                productId: product.Id,
                hasAuthors: !!project._count.Authors,
                hasReviewers: !!project._count.Reviewers
              })
                .filter((t) => t[0].meta.type === ActionType.User)
                .map((t) => t[0].meta.user) as RoleId[]
            ).filter((r) => job.data.operation.roles?.includes(r) ?? true)
          );
          job.updateProgress(40 + ((i + 0.33) * 40) / products.length);
          const toCreate = Array.from(
            new Set(
              Object.entries(allUsers)
                .filter(([users, roles]) => !roleSet.isDisjointFrom(roles))
                .map(([user, roles]) => parseInt(user))
            )
          )
            .filter((u) => job.data.operation.users?.includes(u) ?? true)
            .flatMap((user) =>
              Array.from(roleSet).map((r) => ({
                UserId: user,
                ProductId: product.Id,
                ActivityName: snap.state,
                Status: snap.state,
                Comment: job.data.comment,
                Role: r
              }))
            )
            .filter((t) => allUsers[t.UserId].has(t.Role));
          await DatabaseWrites.userTasks.createMany({
            data: toCreate
          });
          createdTasks = createdTasks.concat(toCreate);
          job.updateProgress(40 + ((i + 0.67) * 40) / products.length);
        }
        // create ProductTransitions if user tasks still exist
        if (
          job.data.operation.type !== BullMQ.UserTasks.OpType.Delete ||
          (await DatabaseReads.userTasks.findFirst({ where: { ProductId: product.Id } }))
        ) {
          await DatabaseWrites.productTransitions.createMany(
            {
              data: await Workflow.transitionEntriesFromState(snap.state, product.Id, {
                ...snap.config,
                productId: product.Id,
                hasAuthors: !!project._count.Authors,
                hasReviewers: !!project._count.Reviewers
              })
            },
            products[i].ProjectId
          );
        }
      }
      job.updateProgress(40 + ((i + 1) * 40) / products.length);
    }
    job.updateProgress(80);
  }

  const notifications: BullMQ.Email.SendBatchUserTaskNotifications['notifications'] = [];
  for (const task of createdTasks) {
    const productInfo = await DatabaseReads.products.findUniqueOrThrow({
      where: {
        Id: task.ProductId
      },
      include: {
        Project: {
          include: {
            Organization: true,
            Owner: true
          }
        },
        ProductDefinition: true
      }
    });
    notifications.push({
      activityName: task.ActivityName!,
      project: productInfo.Project.Name!,
      productName: productInfo.ProductDefinition.Name!,
      status: task.Status!,
      originator: productInfo.Project.Owner.Name!,
      comment: task.Comment ?? '',
      userId: task.UserId
    });
  }
  // might be good to use one job type for all notification types
  await getQueues().Emails.add('Email Notifications', {
    type: BullMQ.JobType.Email_SendBatchUserTaskNotifications,
    notifications
  });
  job.updateProgress(100);
  const userNameMap = await DatabaseReads.users.findMany({
    where: {
      Id: { in: Array.from(new Set(createdTasks.map((t) => t.UserId))) }
    },
    select: {
      Id: true,
      Name: true
    }
  });
  return {
    deleted: deletedCount,
    createdOrUpdated: {
      count: createdTasks.length,
      tasks: createdTasks.map((t) => ({
        productId: t.ProductId,
        user: userNameMap.find((m) => m.Id === t.UserId)?.Name,
        task: t.ActivityName,
        roles: t.Role
      }))
    },
    reassignMap: mapping,
    projectArchived: project.DateArchived ?? false,
    notifications: notifications.length
  };
}
