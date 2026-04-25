import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { TaskType } from '$lib/prisma';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';

async function getDeletionRequestTask(userId: number, productId: string, taskId: number) {
  return await DatabaseReads.userTasks.findFirst({
    where: {
      Id: taskId,
      ProductId: productId,
      UserId: userId,
      Type: TaskType.DeletionRequest,
      ChangeRequests: {
        some: {
          DateCompleted: null
        }
      }
    },
    select: {
      Id: true,
      Status: true,
      Comment: true,
      ChangeRequests: {
        select: {
          Id: true,
          Email: true,
          Change: true,
          DateConfirmed: true
        },
        orderBy: {
          DateCreated: 'desc'
        },
        take: 1
      },
      Product: {
        select: {
          PackageName: true,
          ProductDefinition: {
            select: {
              Name: true,
              Workflow: {
                select: {
                  ProductType: true
                }
              }
            }
          },
          Project: {
            select: {
              Id: true,
              Name: true,
              Description: true
            }
          }
        }
      }
    }
  });
}

export const load = (async ({ params, locals }) => {
  locals.security.requireAuthenticated();
  const taskId = Number(params.task_id);

  const deletionTask = await getDeletionRequestTask(
    locals.security.userId,
    params.product_id,
    taskId
  );

  if (!deletionTask) return error(404);

  const changeRequest = deletionTask.ChangeRequests[0];

  return {
    productId: params.product_id,
    projectId: deletionTask.Product.Project.Id,
    productDescription: deletionTask.Product.ProductDefinition.Name,
    productType: deletionTask.Product.ProductDefinition.Workflow.ProductType,
    projectName: deletionTask.Product.Project.Name,
    projectDescription: deletionTask.Product.Project.Description ?? '',
    packageName: deletionTask.Product.PackageName,
    taskTitle: changeRequest?.Change ?? deletionTask.Status ?? 'Delete User Data',
    deletionRequest: {
      email: changeRequest?.Email ?? '',
      change: changeRequest?.Change ?? deletionTask.Comment ?? deletionTask.Status ?? '',
      dateConfirmed: changeRequest?.DateConfirmed ?? null
    }
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ params, locals }) => {
    locals.security.requireAuthenticated();
    const taskId = Number(params.task_id);

    const deletionTask = await getDeletionRequestTask(
      locals.security.userId,
      params.product_id,
      taskId
    );

    if (!deletionTask) return error(403);

    const requestIds = deletionTask.ChangeRequests.map((request) => request.Id);
    if (!requestIds.length) return error(404);

    await DatabaseWrites.productUserChanges.updateMany({
      where: {
        Id: { in: requestIds }
      },
      data: {
        DateUpdated: new Date(),
        DateCompleted: new Date()
      }
    });

    await DatabaseWrites.userTasks.deleteMany({
      where: {
        Type: TaskType.DeletionRequest,
        ChangeRequests: {
          some: {
            Id: { in: requestIds }
          }
        }
      }
    });

    throw redirect(303, '/tasks');
  }
} satisfies Actions;
