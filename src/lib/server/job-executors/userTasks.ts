import type { Prisma } from '@prisma/client';
import type { Job } from 'bullmq';
import { BullMQ, getQueues } from '../bullmq';
import { DatabaseReads, DatabaseWrites } from '../database';
import prismaInternal from '../database/prisma';
import { Workflow } from '../workflow';
import { RoleId, TaskType } from '$lib/prisma';
import { ActionType } from '$lib/workflowTypes';

export async function workflow(job: Job<BullMQ.UserTasks.Workflow>): Promise<unknown> {
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
      ProjectId: true,
      ProductDefinition: {
        select: {
          Name: true
        }
      }
    }
  });
  job.updateProgress(10);
  const projectId = job.data.scope === 'Project' ? job.data.projectId : products[0].ProjectId;

  const project = await DatabaseReads.projects.findUniqueOrThrow({
    where: { Id: projectId },
    select: {
      Name: true,
      Owner: {
        select: {
          Name: true
        }
      },
      DateArchived: true,
      OrganizationId: true,
      _count: { select: { Reviewers: true, Authors: true } }
    }
  });

  const productIds = products.map((p) => p.Id);

  let createdTasks: Prisma.UserTasksCreateManyInput[] = [];
  let deletedCount = 0;

  // Clear PreExecuteEntries
  if (!project.DateArchived) {
    await DatabaseWrites.productTransitions.deleteMany(
      {
        where: {
          UserId: null,
          ProductId: { in: productIds },
          DateTransition: null,
          QueueRecords: {
            none: {}
          }
        }
      },
      projectId
    );
  }
  job.updateProgress(20);

  let mapping: Awaited<ReturnType<typeof reassignTasks>>['users'] = [];

  if (job.data.operation.type === BullMQ.UserTasks.OpType.Reassign) {
    const { users, tasks } = await reassignTasks(
      job.data.operation.userMapping,
      project.OrganizationId,
      productIds,
      TaskType.Workflow
    );

    mapping = users;
    createdTasks = tasks;

    job.updateProgress(40);
    for (let i = 0; i < products.length; i++) {
      const snap = (await Workflow.getSnapshot(products[i].Id))!;
      job.updateProgress(40 + ((i + 0.2) * 40) / products.length);
      await DatabaseWrites.productTransitions.createMany(
        {
          data: await Workflow.transitionEntriesFromState(snap.state, products[i].Id, snap.input)
        },
        products[i].ProjectId
      );
      job.updateProgress(40 + ((i + 1) * 40) / products.length);
    }
    job.updateProgress(90);
  } else {
    job.updateProgress(25);
    const allUsers = await DatabaseWrites.projects.getUsersByRole(
      projectId,
      job.data.operation.roles
    );
    job.updateProgress(30);
    if (job.data.operation.type !== BullMQ.UserTasks.OpType.Create) {
      // Clear existing UserTasks
      const res = await deleteTasks(
        productIds,
        job.data.operation.users,
        job.data.operation.roles,
        allUsers.keys().toArray(),
        TaskType.Workflow
      );
      deletedCount = res.count;
      job.updateProgress(job.data.operation.type === BullMQ.UserTasks.OpType.Delete ? 90 : 40);
    }
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const snap = await Workflow.getSnapshot(product.Id);
      if (snap) {
        const availableTransitions = Workflow.availableTransitionsFromName(snap.state, snap.input);
        // Create tasks for all users that could perform this activity
        if (!project.DateArchived && job.data.operation.type !== BullMQ.UserTasks.OpType.Delete) {
          const toCreate = await createTasks(
            new Set(
              (
                availableTransitions
                  .filter((t) => t[0].meta.type === ActionType.User)
                  .map((t) => t[0].meta.user) as RoleId[]
              ).filter((r) => job.data.operation.roles?.includes(r) ?? true)
            ),
            allUsers,
            job.data.operation.users,
            product.Id,
            snap.state,
            job.data.comment,
            TaskType.Workflow
          );
          await DatabaseWrites.userTasks.createManyAndReturn({
            data: toCreate
          });
          createdTasks = createdTasks.concat(toCreate);
          job.updateProgress(40 + ((i + 0.67) * 40) / products.length);
        }
        // create ProductTransitions if user tasks still exist
        if (
          job.data.operation.type !== BullMQ.UserTasks.OpType.Delete ||
          (await DatabaseReads.userTasks.findFirst({ where: { ProductId: product.Id } })) ||
          availableTransitions.filter((t) => t[0].meta.type === ActionType.Auto).length
        ) {
          await DatabaseWrites.productTransitions.createMany(
            {
              data: await Workflow.transitionEntriesFromState(snap.state, product.Id, snap.input)
            },
            products[i].ProjectId
          );
        }
      }
      job.updateProgress(40 + ((i + 1) * 40) / products.length);
    }
    job.updateProgress(80);
  }

  job.updateProgress(100);
  return {
    deleted: deletedCount,
    createdOrUpdated: await report(createdTasks),
    reassignMap: mapping,
    projectArchived: project.DateArchived ?? false,
    notifications: (await sendEmails(project, products, createdTasks)).length
  };
}

export async function deleteRequest(job: Job<BullMQ.UserTasks.DeleteRequest>): Promise<unknown> {
  const products = await DatabaseReads.products.findMany({
    where: {
      Id: job.data.scope === 'Product' ? job.data.productId : undefined,
      ProjectId: job.data.scope === 'Project' ? job.data.projectId : undefined
    },
    select: {
      Id: true,
      ProjectId: true,
      ProductDefinition: {
        select: {
          Name: true
        }
      }
    }
  });
  job.updateProgress(10);
  const projectId = job.data.scope === 'Project' ? job.data.projectId : products[0].ProjectId;

  const project = await DatabaseReads.projects.findUniqueOrThrow({
    where: { Id: projectId },
    select: {
      OrganizationId: true,
      Name: true,
      Owner: {
        select: {
          Name: true
        }
      }
    }
  });

  const productIds = products.map((p) => p.Id);

  let createdTasks: Prisma.UserTasksCreateManyInput[] = [];
  let deletedCount = 0;

  job.updateProgress(20);

  let mapping: Awaited<ReturnType<typeof reassignTasks>>['users'] = [];

  if (job.data.operation.type === BullMQ.UserTasks.OpType.Reassign) {
    const { users, tasks } = await reassignTasks(
      job.data.operation.userMapping,
      project.OrganizationId,
      productIds,
      TaskType.DeletionRequest,
      {
        ChangeRequests: job.data.requestId
          ? {
              some: {
                Id: job.data.requestId
              }
            }
          : undefined
      }
    );

    mapping = users;
    createdTasks = tasks;

    job.updateProgress(90);
  } else {
    job.updateProgress(25);
    const allUsers = await DatabaseWrites.projects.getUsersByRole(
      projectId,
      job.data.operation.roles
    );
    job.updateProgress(30);
    if (job.data.operation.type !== BullMQ.UserTasks.OpType.Create) {
      // Clear existing UserTasks
      const res = await deleteTasks(
        productIds,
        job.data.operation.users,
        job.data.operation.roles,
        allUsers.keys().toArray(),
        TaskType.DeletionRequest,
        {
          ChangeRequests: job.data.requestId
            ? {
                some: {
                  Id: job.data.requestId
                }
              }
            : undefined
        }
      );
      deletedCount = res.count;
      job.updateProgress(job.data.operation.type === BullMQ.UserTasks.OpType.Delete ? 90 : 40);
    }
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      // Create tasks for all users that could perform this activity
      if (job.data.operation.type !== BullMQ.UserTasks.OpType.Delete) {
        const toCreate = await createTasks(
          new Set(
            job.data.operation.roles ??
              (job.data.operation.targetRole && [job.data.operation.targetRole])
          ),
          allUsers,
          job.data.operation.users,
          product.Id,
          'Delete User Data',
          job.data.comment,
          TaskType.DeletionRequest
        );
        const res = await DatabaseWrites.userTasks.createManyAndReturn({
          data: toCreate
        });
        createdTasks = createdTasks.concat(toCreate);
        if (job.data.requestId) {
          await prismaInternal.productUserChanges.update({
            where: {
              Id: job.data.requestId
            },
            data: {
              Tasks: {
                connect: res
              }
            }
          });
        }
      }

      job.updateProgress(40 + ((i + 1) * 40) / products.length);
    }
    job.updateProgress(80);
  }

  job.updateProgress(100);
  return {
    deleted: deletedCount,
    createdOrUpdated: await report(createdTasks),
    reassignMap: mapping,
    notifications: (await sendEmails(project, products, createdTasks)).length
  };
}

async function reassignTasks(
  users: {
    from: number;
    to: number;
    withRole?: RoleId;
  }[],
  orgId: number,
  productIds: string[],
  type: TaskType,
  extra: Prisma.UserTasksWhereInput = {}
) {
  const timestamp = new Date();

  return {
    users: await Promise.all(
      users.map(async (u) => {
        const to = await DatabaseReads.users.findUniqueOrThrow({
          where: { Id: u.to },
          select: {
            Name: true,
            UserRoles: {
              where: {
                OR: [{ RoleId: RoleId.SuperAdmin }, { OrganizationId: orgId, RoleId: u.withRole }]
              }
            }
          }
        });

        const targetHasSpecifiedRole = !!(!u.withRole || to.UserRoles.length);

        return {
          from: (
            await DatabaseReads.users.findUniqueOrThrow({
              where: { Id: u.from },
              select: { Name: true }
            })
          ).Name!,
          to: to.Name!,
          count: targetHasSpecifiedRole
            ? (
                await DatabaseWrites.userTasks.updateMany({
                  where: {
                    Role: u.withRole,
                    UserId: u.from,
                    ProductId: { in: productIds },
                    Type: type,
                    ...extra
                  },
                  data: {
                    UserId: u.to,
                    DateUpdated: timestamp
                  }
                })
              ).count
            : 0
        };
      })
    ),
    tasks: await DatabaseReads.userTasks.findMany({
      where: {
        UserId: { in: users.map((u) => u.to) },
        DateUpdated: {
          gte: timestamp
        },
        Type: type,
        ...extra
      }
    })
  };
}

async function deleteTasks(
  productIds: string[],
  users: number[] | undefined,
  roles: RoleId[] | undefined,
  userFallback: number[],
  type: TaskType,
  extra: Prisma.UserTasksWhereInput = {}
) {
  return await DatabaseWrites.userTasks.deleteMany({
    where: {
      ProductId: { in: productIds },
      UserId:
        users || roles
          ? {
              in: users ?? userFallback
            }
          : undefined,
      Role: roles ? { in: roles } : undefined,
      Type: type,
      ...extra
    }
  });
}

async function createTasks(
  roleSet: Set<RoleId>,
  usersByRole: Map<number, Set<RoleId>>,
  userFilter: number[] | undefined,
  productId: string,
  state: string,
  comment: string | null | undefined,
  taskType: TaskType
) {
  comment ||= (
    await DatabaseReads.userTasks.findFirst({
      where: {
        ProductId: productId,
        Type: taskType
      }
    })
  )?.Comment;

  return usersByRole
    .entries()
    .filter((map) => !roleSet.isDisjointFrom(map[1]))
    .filter((map) => userFilter?.includes(map[0]) ?? true)
    .flatMap((map) =>
      Array.from(roleSet).map((r) => ({
        UserId: map[0],
        ProductId: productId,
        ActivityName: state,
        Status: state,
        Comment: comment,
        Role: r,
        Type: taskType
      }))
    )
    .filter((t) => usersByRole.get(t.UserId)?.has(t.Role))
    .toArray() satisfies Prisma.UserTasksCreateManyInput[];
}

async function report(tasks: Prisma.UserTasksCreateManyInput[]) {
  const userNameMap = await DatabaseReads.users.findMany({
    where: {
      Id: { in: Array.from(new Set(tasks.map((t) => t.UserId))) }
    },
    select: {
      Id: true,
      Name: true
    }
  });

  return {
    count: tasks.length,
    tasks: tasks.map((t) => ({
      productId: t.ProductId,
      user: userNameMap.find((m) => m.Id === t.UserId)?.Name,
      task: t.ActivityName,
      roles: t.Role
    }))
  };
}
async function sendEmails(
  project: Prisma.ProjectsGetPayload<{ select: { Name: true; Owner: { select: { Name: true } } } }>,
  products: Prisma.ProductsGetPayload<{
    select: { Id: true; ProductDefinition: { select: { Name: true } } };
  }>[],
  tasks: Prisma.UserTasksCreateManyInput[]
): Promise<BullMQ.Email.SendBatchUserTaskNotifications['notifications']> {
  const notifications = tasks.map((task) => ({
    activityName: task.ActivityName!,
    project: project.Name,
    productName: products.find((p) => p.Id === task.ProductId)?.ProductDefinition.Name ?? '',
    status: task.Status!,
    originator: project.Owner.Name ?? '',
    comment: task.Comment ?? '',
    userId: task.UserId
  }));
  // might be good to use one job type for all notification types
  await getQueues().Emails.add('Email Notifications', {
    type: BullMQ.JobType.Email_SendBatchUserTaskNotifications,
    notifications
  });
  return notifications;
}
