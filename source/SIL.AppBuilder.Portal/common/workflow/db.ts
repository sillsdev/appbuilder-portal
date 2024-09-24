import DatabaseWrites from '../databaseProxy/index.js';
import { prisma } from '../index.js';
import {
  WorkflowContext,
  targetStringFromEvent,
  stateName,
  WorkflowMachine,
  filterMeta,
  ActionType,
  StateName,
  filterTransitions
} from '../public/workflow.js';
import { StateNode } from 'xstate';
import { RoleId, ProductTransitionType } from '../public/prisma.js';

export type Snapshot = {
  value: string;
  context: WorkflowContext;
};

export async function createSnapshot(state: StateName, context: WorkflowContext) {
  return DatabaseWrites.workflowInstances.update({
    where: {
      ProductId: context.productId
    },
    data: {
      Snapshot: JSON.stringify({ value: state, context: context } as Snapshot)
    }
  });
}

export async function getSnapshot(productId: string, machine: WorkflowMachine) {
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
  state: StateName,
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

/** Create ProductTransitions record object */
function transitionFromState(
  state: StateNode<WorkflowContext, any>,
  machineId: string,
  context: WorkflowContext
) {
  const t = filterTransitions(state.on, context)[0][0];
  return {
    ProductId: context.productId,
    TransitionType: ProductTransitionType.Activity,
    InitialState: stateName(state, machineId),
    DestinationState: targetStringFromEvent(t, machineId),
    Command: t.meta.type !== ActionType.Auto ? t.eventType : null
  };
}

/** Create ProductTransitions entries for new product following the "happy" path */
async function populateTransitions(machine: WorkflowMachine, context: WorkflowContext) {
  return DatabaseWrites.productTransitions.createManyAndReturn({
    data: [
      {
        ProductId: context.productId,
        DateTransition: new Date(),
        TransitionType: ProductTransitionType.StartWorkflow
      }
    ].concat(
      Object.entries(machine.states).reduce(
        (p, [k, v], i) =>
          p.concat(
            filterMeta(context, v.meta) &&
              (i === 1 || (i > 1 && p[p.length - 1]?.DestinationState === k && v.type !== 'final'))
              ? [transitionFromState(v, machine.id, context)]
              : []
          ),
        []
      )
    )
  });
}

/**
 * Get all product transitions for a product.
 * If there are none, create new ones based on main sequence (i.e. no Author steps)
 * If sequence matching params exists, but no timestamp, update
 * Otherwise, create.
 */
export async function updateProductTransitions(
  machine: WorkflowMachine,
  context: WorkflowContext,
  userId: number | null,
  initialState: StateName,
  destinationState: StateName,
  command?: string,
  comment?: string
) {
  const transitions = await prisma.productTransitions.count({
    where: {
      ProductId: context.productId
    }
  });
  if (transitions <= 0) {
    await populateTransitions(machine, context);
  }
  const transition = await prisma.productTransitions.findFirst({
    where: {
      ProductId: context.productId,
      InitialState: initialState,
      DestinationState: destinationState,
      DateTransition: null
    },
    select: {
      Id: true
    }
  });

  const user = userId
    ? await prisma.users.findUnique({
        where: {
          Id: userId
        },
        select: {
          Name: true,
          WorkflowUserId: true
        }
      })
    : null;

  if (transition) {
    DatabaseWrites.productTransitions.update({
      where: {
        Id: transition.Id
      },
      data: {
        WorkflowUserId: user?.WorkflowUserId ?? null,
        AllowedUserNames: user?.Name ?? null,
        Command: command ?? null,
        DateTransition: new Date(),
        Comment: comment ?? null
      }
    });
  } else {
    await DatabaseWrites.productTransitions.create({
      data: {
        ProductId: context.productId,
        WorkflowUserId: user?.WorkflowUserId ?? null,
        AllowedUserNames: user?.Name ?? null,
        InitialState: initialState,
        DestinationState: destinationState,
        Command: command ?? null,
        DateTransition: new Date(),
        Comment: comment ?? null
      }
    });
  }
}

export async function projectHasAuthors(ctx: WorkflowContext) {
  return (await prisma.products.findUnique({
    where: {
      Id: ctx.productId
    },
    select: {
      Project: {
        select: {
            Authors: {
              select: {
                Id: true
              }
            }
          }
      }
    }
  })).Project.Authors.length > 0;
}

export async function projectHasReviewers(ctx: WorkflowContext) {
  return (await prisma.products.findUnique({
    where: {
      Id: ctx.productId
    },
    select: {
      Project: {
        select: {
            Reviewers: {
              select: {
                Id: true
              }
            }
          }
      }
    }
  })).Project.Reviewers.length > 0;
}
