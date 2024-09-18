import DatabaseWrites from '../databaseProxy/index.js';
import { prisma } from '../index.js';
import { WorkflowContext } from '../public/workflow.js';
import { AnyStateMachine } from 'xstate';
import { RoleId } from '../public/prisma.js';

export type Snapshot = {
  value: string;
  context: WorkflowContext;
};

export async function createSnapshot(state: string, context: WorkflowContext) {
  return DatabaseWrites.workflowInstances.update({
    where: {
      ProductId: context.productId
    },
    data: {
      Snapshot: JSON.stringify({ value: state, context: context } as Snapshot)
    }
  });
}

export async function getSnapshot(productId: string, machine: AnyStateMachine) {
  const snap = JSON.parse(
    (
      await prisma.workflowInstances.findUnique({
        where: {
          ProductId: productId
        },
        select: {
          Snapshot: true
        }
      })
    )?.Snapshot || 'null'
  ) as Snapshot | undefined;

  if (snap) {
    return machine.resolveState(snap);
  }
  return undefined;
}

/**
 * Delete all tasks for a product.
 * Then create new tasks based on the provided user roles:
 * - OrgAdmin for administrative tasks (Product.Project.Organization.UserRoles.User where Role === OrgAdmin)
 * - AppBuilder for project owner tasks (Product.Project.Owner)
 * - Author for author tasks (Product.Project.Authors)
 */
export async function updateUserTasks(
  productId: string,
  roles: RoleId[],
  state: string,
  comment?: string
) {
  // Delete all tasks for a product
  await DatabaseWrites.userTasks.deleteMany({
    where: {
      ProductId: productId
    }
  });

  const product = await prisma.products.findUnique({
    where: {
      Id: productId
    },
    select: {
      Project: {
        select: {
          Organization: {
            select: {
              UserRoles: {
                where: {
                  RoleId: RoleId.OrgAdmin
                },
                select: {
                  UserId: true
                }
              }
            }
          },
          OwnerId: true,
          Authors: {
            select: {
              UserId: true
            }
          }
        }
      }
    }
  });

  const uids = roles
    .map((r) => {
      switch (r) {
        case RoleId.OrgAdmin:
          return product.Project.Organization.UserRoles.map((u) => u.UserId);
        case RoleId.AppBuilder:
          return [product.Project.OwnerId];
        case RoleId.Author:
          return product.Project.Authors.map((a) => a.UserId);
        default:
          break;
      }
    })
    .reduce((p, c) => p.concat(c), []);

  const timestamp = new Date();

  return DatabaseWrites.userTasks.createMany({
    data: uids.map((u) => ({
      UserId: u,
      ProductId: productId,
      ActivityName: state,
      Status: state,
      Comment: comment,
      DateCreated: timestamp,
      DateUpdated: timestamp
    }))
  });
}
