import { StartupWorkflow } from './startup-workflow.js';
import { createActor } from 'xstate';
import type {
  Actor,
  StateNode as XStateNode,
  TransitionDefinitionMap,
  InspectedSnapshotEvent,
  TransitionDefinition
} from 'xstate';
import DatabaseWrites from '../databaseProxy/index.js';
import {
  WorkflowContext,
  WorkflowContextBase,
  WorkflowConfig,
  ActionType,
  StateNode,
  WorkflowEvent,
  MetaFilter,
  WorkflowTransitionMeta,
  Snapshot,
  WorkflowState,
  TerminalStateFilter
} from '../public/workflow.js';
import prisma from '../prisma.js';
import { RoleId, ProductTransitionType, WorkflowType } from '../public/prisma.js';
import { allUsersByRole } from '../databaseProxy/UserRoles.js';
import { Prisma } from '@prisma/client';

/**
 * Wraps a workflow instance and provides methods to interact.
 */
export class Workflow {
  private flow: Actor<typeof StartupWorkflow> | null;
  private productId: string;
  private currentState: XStateNode<WorkflowContext, WorkflowEvent> | null;
  private config: WorkflowConfig;

  private constructor(productId: string, config: WorkflowConfig) {
    this.productId = productId;
    this.config = config;
  }

  /* PUBLIC METHODS */
  /** Create a new workflow instance and populate the database tables. */
  public static async create(productId: string, config: WorkflowConfig): Promise<Workflow> {
    const flow = new Workflow(productId, config);

    const check = await flow.checkAuthorsAndReviewers();

    flow.flow = createActor(StartupWorkflow, {
      inspect: (e) => {
        if (e.type === '@xstate.snapshot') flow.inspect(e);
      },
      input: {
        productId,
        hasAuthors: check._count.Authors > 0,
        hasReviewers: check._count.Authors > 0,
        ...config
      }
    });

    flow.flow.start();
    flow.populateTransitions();
    flow.updateUserTasks();

    return flow;
  }
  /** Restore from a snapshot in the database. */
  public static async restore(productId: string): Promise<Workflow> {
    const snap = await Workflow.getSnapshot(productId);
    const flow = new Workflow(productId, snap.config);
    const check = await flow.checkAuthorsAndReviewers();
    flow.flow = createActor(StartupWorkflow, {
      snapshot: snap
        ? StartupWorkflow.resolveState({
            value: snap.state,
            context: {
              ...snap.context,
              ...snap.config,
              productId: productId,
              hasAuthors: check._count.Authors > 0,
              hasReviewers: check._count.Authors > 0
            }
          })
        : undefined,
      inspect: (e) => {
        if (e.type === '@xstate.snapshot') flow.inspect(e);
      }
    });

    flow.flow.start();

    return flow;
  }

  /** Send a transition event to the workflow. */
  public async send(event: WorkflowEvent): Promise<void> {
    this.flow?.send(event);
  }

  /**
   * Stops the current running workflow.
   *
   * Note: This does not mean that the workflow is terminated.
   */
  public stop(): void {
    this.flow?.stop();
  }

  /** Retrieves the workflow's snapshot from the database */
  public static async getSnapshot(productId: string): Promise<Snapshot> {
    const snap = await prisma.workflowInstances.findFirst({
      where: {
        ProductId: productId,
        NOT: TerminalStateFilter
      },
      select: {
        State: true,
        Context: true,
        WorkflowDefinition: {
          select: {
            ProductType: true,
            WorkflowOptions: true
          }
        }
      }
    });
    return {
      state: snap.State,
      context: JSON.parse(snap.Context) as WorkflowContextBase,
      config: {
        productType: snap.WorkflowDefinition.ProductType,
        options: snap.WorkflowDefinition.WorkflowOptions
      }
    };
  }

  /** Returns the name of the current state */
  public state() {
    return this.flow?.getSnapshot().value;
  }

  /** Returns a list of valid transitions from the provided state. */
  public static availableTransitionsFromName(stateName: string, config: WorkflowConfig) {
    return Workflow.availableTransitionsFromNode(
      StartupWorkflow.getStateNodeById(Workflow.stateIdFromName(stateName)),
      config
    );
  }

  public static availableTransitionsFromNode(s: XStateNode<any, any>, config: WorkflowConfig) {
    return Workflow.filterTransitions(s.on, config);
  }

  /** Transform state machine definition into something more easily usable by the visualization algorithm */
  public serializeForVisualization(): StateNode[] {
    const machine = StartupWorkflow;
    const states = Object.entries(machine.states).filter(([k, v]) =>
      Workflow.filterMeta(this.config, v.meta?.includeWhen)
    );
    const lookup = states.map((s) => s[0]);
    const actions: StateNode[] = [];
    return states
      .map(([k, v]) => {
        return {
          id: lookup.indexOf(k),
          label: k,
          connections: Workflow.filterTransitions(v.on, this.config).map((o) => {
            let target = Workflow.targetStringFromEvent(o[0]);
            if (!target) {
              target = o[0].eventType;
              lookup.push(target);
              actions.push({
                id: lookup.lastIndexOf(target),
                label: target,
                connections: [
                  {
                    id: lookup.indexOf(k),
                    target: k,
                    label: ''
                  }
                ],
                inCount: 1,
                action: true
              });
            }
            return {
              // treat no target on transition as self target
              id: lookup.lastIndexOf(target),
              target: target,
              label: o[0].eventType
            };
          }),
          inCount: states
            .map(([k, v]) => {
              return Workflow.filterTransitions(v.on, this.config).map((e) => {
                // treat no target on transition as self target
                return { from: k, to: Workflow.targetStringFromEvent(e[0]) || k };
              });
            })
            .reduce((p, c) => {
              return p.concat(c);
            }, [])
            .filter((v) => k === v.to).length,
          start: k === WorkflowState.Start,
          final: v.type === 'final'
        } as StateNode;
      })
      .concat(actions);
  }

  /* PRIVATE METHODS */
  private async inspect(event: InspectedSnapshotEvent): Promise<void> {
    const old = this.currentState;
    const snap = this.flow.getSnapshot();
    this.currentState = StartupWorkflow.getStateNodeById(`#${StartupWorkflow.id}.${snap.value}`);

    if (old && Workflow.stateName(old) !== snap.value) {
      await this.updateProductTransitions(
        event.event.userId,
        Workflow.stateName(old),
        Workflow.stateName(this.currentState),
        event.event.type,
        event.event.comment || undefined
      );
      await DatabaseWrites.productTransitions.deleteMany({
        where: {
          ProductId: this.productId,
          DateTransition: null,
          WorkflowUserId: null
        }
      });
      await DatabaseWrites.productTransitions.createMany({
        data: await Workflow.transitionEntriesFromState(snap.value, this.productId, this.config)
      });
    }

    await this.createSnapshot(snap.context);
    if (old && Workflow.stateName(old) !== snap.value) {
      await this.updateUserTasks(event.event.comment || undefined);
    }
  }

  private async createSnapshot(context: WorkflowContext) {
    const instance = await prisma.workflowInstances.findFirst({
      where: {
        ProductId: this.productId,
        NOT: TerminalStateFilter
      },
      select: {
        Id: true
      }
    });

    const filtered = {
      ...context,
      productId: undefined,
      hasAuthors: undefined,
      hasReviewers: undefined,
      productType: undefined,
      options: undefined
    } as WorkflowContextBase;
    if (instance) {
      return DatabaseWrites.workflowInstances.update({
        where: {
          Id: instance.Id
        },
        data: {
          State: Workflow.stateName(this.currentState),
          Context: JSON.stringify(filtered)
        }
      });
    } else {
      return DatabaseWrites.workflowInstances.create({
        data: {
          ProductId: this.productId,
          State: Workflow.stateName(this.currentState),
          Context: JSON.stringify(context),
          WorkflowDefinitionId: (
            await prisma.products.findUnique({
              where: {
                Id: this.productId
              },
              select: {
                ProductDefinition: {
                  select: {
                    WorkflowId: true
                  }
                }
              }
            })
          ).ProductDefinition.WorkflowId
        }
      });
    }
  }

  /** Filter a states transitions based on provided context */
  private static filterTransitions(
    on: TransitionDefinitionMap<WorkflowContext, WorkflowEvent>,
    filter: WorkflowConfig
  ) {
    return Object.values(on)
      .map((v) => v.filter((t) => Workflow.filterMeta(filter, t.meta?.includeWhen)))
      .filter((v) => v.length > 0 && Workflow.filterMeta(filter, v[0].meta?.includeWhen));
  }

  /**
   * Include state/transition if:
   *  - no conditions are specified
   *  - OR
   *    - One of the provided user role features matches the context
   *    - AND
   *    - One of the provided product types matches the context
   */
  public static filterMeta(filter: WorkflowConfig, meta?: MetaFilter) {
    return (
      meta === undefined ||
      ((meta.options !== undefined
        ? meta.options.filter((urf) => filter.options.includes(urf)).length > 0
        : true) &&
        (meta.productTypes !== undefined ? meta.productTypes.includes(filter.productType) : true))
    );
  }

  /**
   * Delete all tasks for a product.
   * Then create new tasks based on the provided user roles:
   * - OrgAdmin for administrative tasks (Product.Project.Organization.UserRoles.User where Role === OrgAdmin)
   * - AppBuilder for project owner tasks (Product.Project.Owner)
   * - Author for author tasks (Product.Project.Authors)
   */
  private async updateUserTasks(comment?: string) {
    // Delete all tasks for a product
    await DatabaseWrites.userTasks.deleteMany({
      where: {
        ProductId: this.productId
      }
    });

    const product = await prisma.products.findUnique({
      where: {
        Id: this.productId
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

    const uids = Workflow.availableTransitionsFromNode(this.currentState, this.config)
      .map((t) => (t[0].meta as WorkflowTransitionMeta)?.user)
      .filter((u) => u !== undefined)
      .map((r) => {
        switch (r) {
          case RoleId.OrgAdmin:
            return product.Project.Organization.UserRoles.map((u) => u.UserId);
          case RoleId.AppBuilder:
            return [product.Project.OwnerId];
          case RoleId.Author:
            return product.Project.Authors.map((a) => a.UserId);
          default:
            return [];
        }
      })
      .reduce((p, c) => p.concat(c), [])
      .filter((u, i, a) => a.indexOf(u) === i);

    return DatabaseWrites.userTasks.createMany({
      data: uids.map((u) => ({
        UserId: u,
        ProductId: this.productId,
        ActivityName: Workflow.stateName(this.currentState),
        Status: Workflow.stateName(this.currentState),
        Comment: comment ?? null
      }))
    });
  }

  /** Create ProductTransitions record object */
  private static transitionFromState(
    state: XStateNode<WorkflowContext, any>,
    productId: string,
    config: WorkflowConfig,
    users: Map<RoleId, string[]>
  ): Prisma.ProductTransitionsCreateManyInput {
    const t = Workflow.filterTransitions(state.on, config)[0][0];

    return {
      ProductId: productId,
      AllowedUserNames:
        t.meta.type === ActionType.User
          ? Array.from(
              new Set(
                Array.from(users.entries())
                  .filter(([role, users]) => t.meta.user === role)
                  .map(([role, users]) => users)
                  .reduce((p, c) => p.concat(c), [])
              )
            ).join()
          : null,
      TransitionType: ProductTransitionType.Activity,
      InitialState: Workflow.stateName(state),
      DestinationState: Workflow.targetStringFromEvent(t),
      Command: t.meta.type !== ActionType.Auto ? t.eventType : null,
      WorkflowType: WorkflowType.Startup // TODO: Change this once we support more workflow types
    };
  }

  /** Create ProductTransitions entries for new product following the "happy" path */
  private async populateTransitions() {
    // TODO: AllowedUserNames
    return DatabaseWrites.productTransitions.createManyAndReturn({
      data: await Workflow.transitionEntriesFromState(
        WorkflowState.Start,
        this.productId,
        this.config
      )
    });
  }

  public static async transitionEntriesFromState(
    stateName: string,
    productId: string,
    config: WorkflowConfig
  ): Promise<Prisma.ProductTransitionsCreateManyInput[]> {
    const projectId = (
      await prisma.products.findUnique({
        where: {
          Id: productId
        },
        select: {
          ProjectId: true
        }
      })
    ).ProjectId;
    const uidsByRole = await allUsersByRole(projectId);
    const users = new Map<RoleId, string[]>();
    (
      await Promise.all(
        Array.from(uidsByRole.entries()).map(async ([role, uids]) => ({
          role: role,
          users: await prisma.users.findMany({
            where: {
              Id: { in: uids }
            },
            select: {
              Name: true
            }
          })
        }))
      )
    ).forEach((r) => {
      users.set(
        r.role,
        r.users.map((u) => u.Name)
      );
    });
    const ret: Prisma.ProductTransitionsCreateManyInput[] = [
      Workflow.transitionFromState(
        stateName === WorkflowState.Start
          ? Workflow.availableTransitionsFromName(WorkflowState.Start, config)[0][0].target[0]
          : StartupWorkflow.getStateNodeById(Workflow.stateIdFromName(stateName)),
        productId,
        config,
        users
      )
    ];
    while (ret.at(-1).DestinationState !== WorkflowState.Published) {
      ret.push(
        Workflow.transitionFromState(
          Workflow.nodeFromName(ret.at(-1).DestinationState),
          productId,
          config,
          users
        )
      );
    }
    return ret;
  }

  /**
   * Get all product transitions for a product.
   * If there are none, create new ones based on main sequence (i.e. no Author steps)
   * If sequence matching params exists, but no timestamp, update
   * Otherwise, create.
   */
  private async updateProductTransitions(
    userId: number | null,
    initialState: string,
    destinationState: string,
    command?: string,
    comment?: string
  ) {
    const transition = await prisma.productTransitions.findFirst({
      where: {
        ProductId: this.productId,
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
      await DatabaseWrites.productTransitions.update({
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
          ProductId: this.productId,
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

  private static stateName(s: XStateNode<any, any>): string {
    return s.id.replace(StartupWorkflow.id + '.', '');
  }

  private static stateIdFromName(s: string): string {
    return StartupWorkflow.id + '.' + s;
  }

  private static nodeFromName(s: string): XStateNode<WorkflowContext, WorkflowEvent> {
    return StartupWorkflow.getStateNodeById(Workflow.stateIdFromName(s));
  }

  private static targetStringFromEvent(e: TransitionDefinition<any, any>): string {
    return (
      e
        .toJSON()
        .target?.at(0)
        ?.replace('#' + StartupWorkflow.id + '.', '') || ''
    );
  }

  private async checkAuthorsAndReviewers() {
    return (
      await prisma.projects.findMany({
        where: {
          Products: {
            some: {
              Id: this.productId
            }
          }
        },
        select: {
          _count: {
            select: {
              Authors: true,
              Reviewers: true
            }
          }
        }
      })
    )[0];
  }
}
