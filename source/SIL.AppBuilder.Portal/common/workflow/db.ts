import DatabaseWrites from '../databaseProxy/index.js';
import { prisma } from '../index.js';
import { WorkflowContext, targetStringFromEvent, stateName } from '../public/workflow.js';
import { AnyStateMachine, StateNode } from 'xstate';
import { RoleId, ProductTransitionType } from '../public/prisma.js';

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

function transitionFromState(state: StateNode<any, any>, machineId: string, productId: string) {
  console.log(state);
  return {
    ProductId: productId,
    TransitionType: ProductTransitionType.Activity,
    InitialState: stateName(state, machineId),
    DestinationState: targetStringFromEvent(Object.values(state.on)[0], machineId),
    Command:
      Object.keys(state.on)[0].split(':')[1] !== 'Auto'
        ? Object.keys(state.on)[0].split(':')[0]
        : null
  };
}

async function populateTransitions(machine: AnyStateMachine, productId: string) {
  return DatabaseWrites.productTransitions.createManyAndReturn({
    data: [
      {
        ProductId: productId,
        DateTransition: new Date(),
        TransitionType: ProductTransitionType.StartWorkflow
      }
    ].concat(
      Object.entries(machine.states).reduce(
        (p, [k, v], i) =>
          p.concat(
            i === 1 || (i > 1 && p[p.length - 1]?.DestinationState === k && v.type !== 'final')
              ? [transitionFromState(v, machine.id, productId)]
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
  machine: AnyStateMachine,
  productId: string,
  userId: number | null,
  initialState: string,
  destinationState: string,
  command?: string,
  comment?: string
) {
  const transitions = await prisma.productTransitions.count({
    where: {
      ProductId: productId
    }
  });
  if (transitions <= 0) {
    await populateTransitions(machine, productId);
  }
  const transition = await prisma.productTransitions.findFirst({
    where: {
      ProductId: productId,
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
        ProductId: productId,
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
