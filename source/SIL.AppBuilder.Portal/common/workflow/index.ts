import { Prisma } from '@prisma/client';
import type {
  Actor,
  InspectedSnapshotEvent,
  TransitionDefinition,
  TransitionDefinitionMap,
  StateNode as XStateNode
} from 'xstate';
import { createActor } from 'xstate';
import DatabaseWrites from '../databaseProxy/index.js';
import { allUsersByRole } from '../databaseProxy/UserRoles.js';
import { BullMQ, Queues } from '../index.js';
import prisma from '../prisma.js';
import { ProductTransitionType, RoleId } from '../public/prisma.js';
import type {
  Snapshot,
  StateNode,
  WorkflowConfig,
  WorkflowContext,
  WorkflowEvent,
  WorkflowInstanceContext
} from '../public/workflow.js';
import {
  ActionType,
  includeStateOrTransition,
  TerminalStates,
  WorkflowState
} from '../public/workflow.js';
import { WorkflowStateMachine } from './state-machine.js';

/**
 * Wraps a workflow instance and provides methods to interact.
 */
export class Workflow {
  private flow: Actor<typeof WorkflowStateMachine> | null;
  private productId: string;
  private currentState: XStateNode<WorkflowContext, WorkflowEvent> | null;
  private config: WorkflowConfig;

  private constructor(productId: string, config: WorkflowConfig) {
    this.flow = null; // to make svelte-check happy
    this.currentState = null; // ^^^
    this.productId = productId;
    this.config = config;
  }

  /* PUBLIC METHODS */
  /** Create a new workflow instance and populate the database tables. */
  public static async create(productId: string, config: WorkflowConfig): Promise<Workflow> {
    const flow = new Workflow(productId, config);

    const check = await flow.checkAuthorsAndReviewers();

    flow.flow = createActor(WorkflowStateMachine, {
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
    await flow.createSnapshot(flow.flow.getSnapshot().context);
    await DatabaseWrites.productTransitions.create({
      data: {
        ProductId: productId,
        DateTransition: new Date(),
        TransitionType: ProductTransitionType.StartWorkflow,
        WorkflowType: config.workflowType
      }
    });
    await Queues.UserTasks.add(`Create UserTasks for Product #${productId}`, {
      type: BullMQ.JobType.UserTasks_Modify,
      scope: 'Product',
      productId: productId,
      operation: {
        type: BullMQ.UserTasks.OpType.Create
      }
    });

    return flow;
  }
  /** Restore from a snapshot in the database. */
  public static async restore(productId: string): Promise<Workflow | null> {
    const snap = await Workflow.getSnapshot(productId);
    if (!snap) { return null; }
    const flow = new Workflow(productId, snap.config);
    const check = await flow.checkAuthorsAndReviewers();
    flow.flow = createActor(WorkflowStateMachine, {
      snapshot: snap
        ? WorkflowStateMachine.resolveState({
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
      },
      input: {
        ...snap.config,
        productId: productId,
        hasAuthors: check._count.Authors > 0,
        hasReviewers: check._count.Authors > 0
      }
    });

    flow.flow.start();

    return flow;
  }

  /** Send a transition event to the workflow. */
  public send(event: WorkflowEvent): void {
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
  public static async getSnapshot(productId: string): Promise<Snapshot | null> {
    const instance = await prisma.workflowInstances.findUnique({
      where: {
        ProductId: productId
      },
      select: {
        Id: true,
        State: true,
        Context: true,
        WorkflowDefinition: {
          select: {
            Id: true,
            ProductType: true,
            WorkflowOptions: true,
            Type: true
          }
        }
      }
    });
    if (!instance) {
      return null;
    }
    return {
      instanceId: instance.Id,
      definitionId: instance.WorkflowDefinition.Id,
      state: instance.State,
      context: JSON.parse(instance.Context) as WorkflowInstanceContext,
      config: {
        workflowType: instance.WorkflowDefinition.Type,
        productType: instance.WorkflowDefinition.ProductType,
        options: new Set(instance.WorkflowDefinition.WorkflowOptions)
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
      WorkflowStateMachine.getStateNodeById(Workflow.stateIdFromName(stateName)),
      config
    );
  }

  public static availableTransitionsFromNode(
    s: XStateNode<WorkflowContext, WorkflowEvent>,
    config: WorkflowConfig
  ) {
    return Workflow.filterTransitions(s.on, config);
  }

  /** Transform state machine definition into something more easily usable by the visualization algorithm */
  public serializeForVisualization(): StateNode[] {
    const states = Object.entries(WorkflowStateMachine.states).filter(([k, v]) =>
      includeStateOrTransition(this.config, v.meta?.includeWhen)
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
    const xSnap = this.flow!.getSnapshot();
    this.currentState = WorkflowStateMachine.getStateNodeById(`#${WorkflowStateMachine.id}.${xSnap.value}`);

    if (old && Workflow.stateName(old) !== xSnap.value) {
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
      // Yes, the ModifyUserTasks will also delete tasks. I just have this here so the tasks are cleared immediately, and so that the tasks are also cleared when the instance is deleted.
      await DatabaseWrites.userTasks.deleteMany({
        where: {
          ProductId: this.productId
        }
      });
      if (xSnap.value in TerminalStates) {
        await DatabaseWrites.workflowInstances.delete(this.productId);
      } else {
        await this.createSnapshot(xSnap.context);
        // This will also create the dummy entries in the ProductTransitions table
        await Queues.UserTasks.add(`Update UserTasks for Product #${this.productId}`, {
          type: BullMQ.JobType.UserTasks_Modify,
          scope: 'Product',
          productId: this.productId,
          comment: event.event.comment || undefined,
          operation: {
            type: BullMQ.UserTasks.OpType.Update
          }
        });
      }
    }
  }

  private async createSnapshot(context: WorkflowContext) {
    const filtered = {
      ...context,
      productId: undefined,
      hasAuthors: undefined,
      hasReviewers: undefined,
      productType: undefined,
      options: undefined
    } as WorkflowInstanceContext;
    return DatabaseWrites.workflowInstances.upsert({
      where: {
        ProductId: this.productId
      },
      create: {
        ProductId: this.productId,
        State: Workflow.stateName(this.currentState!),
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
        )!.ProductDefinition.WorkflowId
      },
      update: {
        State: Workflow.stateName(this.currentState!),
        Context: JSON.stringify(filtered)
      }
    });
  }

  /** Filter a states transitions based on provided context */
  private static filterTransitions(
    on: TransitionDefinitionMap<WorkflowContext, WorkflowEvent>,
    filter: WorkflowConfig
  ) {
    return Object.values(on)
      .map((v) => v.filter((t) => includeStateOrTransition(filter, t.meta?.includeWhen)))
      .filter((v) => v.length > 0 && includeStateOrTransition(filter, v[0].meta?.includeWhen));
  }

  /** Create ProductTransitions record object */
  private static transitionFromState(
    state: XStateNode<WorkflowContext, WorkflowEvent>,
    productId: string,
    config: WorkflowConfig,
    users: Record<string, Set<RoleId>>
  ): Prisma.ProductTransitionsCreateManyInput {
    const t = Workflow.filterTransitions(state.on, config)[0][0];

    return {
      ProductId: productId,
      AllowedUserNames:
        t.meta.type === ActionType.User
          ? Array.from(
            new Set(
              Object.entries(users)
                .filter(([user, roles]) => roles.has(t.meta.user))
                .map(([user, roles]) => user)
            )
          ).join()
          : null,
      TransitionType: ProductTransitionType.Activity,
      InitialState: Workflow.stateName(state),
      DestinationState: Workflow.targetStringFromEvent(t),
      Command: t.meta.type !== ActionType.Auto ? t.eventType : null,
      WorkflowType: config.workflowType
    };
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
    )!.ProjectId;
    const allUsers = await allUsersByRole(projectId);
    const users = Object.fromEntries(
      (
        await prisma.users.findMany({
          where: {
            Id: { in: Object.keys(allUsers).map((str) => parseInt(str)) }
          },
          select: {
            Id: true,
            Name: true
          }
        })
      ).map((u) => [u.Name, allUsers[u.Id]])
    );
    const ret: Prisma.ProductTransitionsCreateManyInput[] = [
      Workflow.transitionFromState(
        stateName === WorkflowState.Start
          ? Workflow.availableTransitionsFromName(WorkflowState.Start, config)[0][0]!.target![0]
          : WorkflowStateMachine.getStateNodeById(Workflow.stateIdFromName(stateName)),
        productId,
        config,
        users
      )
    ];
    while (ret.at(-1)!.DestinationState !== WorkflowState.Published) {
      ret.push(
        Workflow.transitionFromState(
          Workflow.nodeFromName(ret.at(-1)!.DestinationState!),
          productId,
          config,
          users
        )
      );
    }
    return ret;
  }

  /**
   * Update or create product transition
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
          Comment: comment ?? null,
          WorkflowType: this.config.workflowType
        }
      });
    }
  }

  private static stateName(s: XStateNode<WorkflowContext, WorkflowEvent>): string {
    return s.id.replace(WorkflowStateMachine.id + '.', '');
  }

  private static stateIdFromName(s: string): string {
    return WorkflowStateMachine.id + '.' + s;
  }

  private static nodeFromName(s: string): XStateNode<WorkflowContext, WorkflowEvent> {
    return WorkflowStateMachine.getStateNodeById(Workflow.stateIdFromName(s));
  }

  private static targetStringFromEvent(
    e: TransitionDefinition<WorkflowContext, WorkflowEvent>
  ): string {
    return (
      e
        .toJSON()
        .target?.at(0)
        ?.replace('#' + WorkflowStateMachine.id + '.', '') || ''
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
