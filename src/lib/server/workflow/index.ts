import type { Prisma } from '@prisma/client';
import type {
  Actor,
  InspectedSnapshotEvent,
  StateNode as XStateNode,
  TransitionDefinition,
  TransitionDefinitionMap
} from 'xstate';
import { createActor } from 'xstate';
import type { RoleId } from '../../prisma';
import { ProductTransitionType, WorkflowType } from '../../prisma';
import {
  ActionType,
  WorkflowAction,
  WorkflowState,
  includeStateOrTransition,
  isTerminal
} from '../../workflowTypes';
import type {
  Snapshot,
  StateNode,
  WorkflowConfig,
  WorkflowContext,
  WorkflowEvent,
  WorkflowInput,
  WorkflowInstanceContext
} from '../../workflowTypes';
import { BullMQ, getQueues } from '../bullmq';
import { DatabaseReads, DatabaseWrites } from '../database';
import { allUsersByRole } from '../database/UserRoles';
import { WorkflowStateMachine } from './state-machine';

/**
 * Wraps a workflow instance and provides methods to interact.
 */
export class Workflow {
  private flow: Actor<typeof WorkflowStateMachine> | null;
  private productId: string;
  private currentState: XStateNode<WorkflowContext, WorkflowEvent> | null;
  private input: WorkflowInput;

  private constructor(productId: string, input: WorkflowInput) {
    this.flow = null; // to make svelte-check happy
    this.currentState = null; // ^^^
    this.productId = productId;
    this.input = input;
  }

  /* PUBLIC METHODS */
  /** Create a new workflow instance and populate the database tables. */
  public static async create(productId: string, config: WorkflowConfig): Promise<Workflow> {
    const check = await DatabaseReads.products.findUnique({
      where: {
        Id: productId
      },
      select: {
        Project: {
          select: {
            _count: {
              select: {
                Authors: true,
                Reviewers: true
              }
            }
          }
        }
      }
    });
    const flow = new Workflow(productId, {
      ...config,
      hasAuthors: !!check?.Project._count.Authors,
      hasReviewers: !!check?.Project._count.Reviewers,
      productId
    });
    flow.flow = createActor(WorkflowStateMachine, {
      inspect: (e) => {
        if (e.type === '@xstate.snapshot') flow.inspect(e);
      },
      input: flow.input
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
    await getQueues().UserTasks.add(`Create UserTasks for Product #${productId}`, {
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
    if (!snap) {
      return null;
    }
    const flow = new Workflow(productId, snap.input);

    flow.flow = createActor(WorkflowStateMachine, {
      snapshot: snap
        ? WorkflowStateMachine.resolveState({
            value: snap.state,
            context: {
              ...snap.context,
              ...flow.input
            }
          })
        : undefined,
      inspect: (e) => {
        if (e.type === '@xstate.snapshot') flow.inspect(e);
      },
      input: flow.input
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
    const instance = await DatabaseReads.workflowInstances.findUnique({
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
        },
        Product: {
          select: {
            Project: {
              select: {
                _count: {
                  select: {
                    Authors: true,
                    Reviewers: true
                  }
                }
              }
            }
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
      input: {
        workflowType: instance.WorkflowDefinition.Type,
        productType: instance.WorkflowDefinition.ProductType,
        options: new Set(instance.WorkflowDefinition.WorkflowOptions),
        hasAuthors: !!instance.Product.Project._count.Authors,
        hasReviewers: !!instance.Product.Project._count.Reviewers,
        productId
      }
    };
  }

  /** Returns the name of the current state */
  public state() {
    return this.flow?.getSnapshot().value;
  }

  /** Returns a list of valid transitions from the provided state. */
  public static availableTransitionsFromName(stateName: string, input: WorkflowInput) {
    return Workflow.availableTransitionsFromNode(
      WorkflowStateMachine.getStateNodeById(Workflow.stateIdFromName(stateName)),
      input
    );
  }

  public static availableTransitionsFromNode(
    s: XStateNode<WorkflowContext, WorkflowEvent>,
    input: WorkflowInput
  ) {
    return Workflow.filterTransitions(s.on, input);
  }

  /** Transform state machine definition into something more easily usable by the visualization algorithm */
  public serializeForVisualization(): StateNode[] {
    const states = Object.entries(WorkflowStateMachine.states).filter(([k, v]) =>
      includeStateOrTransition(this.input, v.meta?.includeWhen)
    );
    const lookup = states.map((s) => s[0]);
    const actions: StateNode[] = [];
    return states
      .map(([k, v]) => {
        return {
          id: lookup.indexOf(k),
          label: k,
          connections: Workflow.filterTransitions(v.on, this.input).map((o) => {
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
            .flatMap(([k, v]) => {
              return Workflow.filterTransitions(v.on, this.input).map((e) => {
                // treat no target on transition as self target
                return { from: k, to: Workflow.targetStringFromEvent(e[0]) || k };
              });
            })
            .filter((v) => k === v.to).length,
          start: k === WorkflowState.Start,
          final: v.type === 'final'
        } as StateNode;
      })
      .concat(actions);
  }

  /* PRIVATE METHODS */
  private async inspect(iEvent: InspectedSnapshotEvent): Promise<void> {
    const event = iEvent.event as WorkflowEvent;
    const old = this.currentState;
    const xSnap = this.flow!.getSnapshot();
    this.currentState = WorkflowStateMachine.getStateNodeById(
      `#${WorkflowStateMachine.id}.${xSnap.value}`
    );

    const stateChange = !!old && Workflow.stateName(old) !== xSnap.value;
    const migration = event.type === WorkflowAction.Migrate;
    const jump = event.type === WorkflowAction.Jump;

    if (stateChange && !migration) {
      await this.updateProductTransitions(
        jump ? null : event.userId,
        Workflow.stateName(old),
        Workflow.stateName(this.currentState),
        event.type,
        jump ? undefined : event.comment
      );
    } else if (migration) {
      await DatabaseWrites.productTransitions.create({
        data: {
          ProductId: this.productId,
          DateTransition: new Date(),
          TransitionType: ProductTransitionType.Migration,
          WorkflowType: this.input.workflowType
        }
      });
      if (event.target !== xSnap.value) {
        await DatabaseWrites.productTransitions.create({
          data: {
            ProductId: this.productId,
            InitialState: event.target,
            DestinationState: xSnap.value,
            Command: 'Migrate',
            Comment: `${event.target} => ${xSnap.value}`,
            DateTransition: new Date(),
            TransitionType: ProductTransitionType.Activity,
            WorkflowType: this.input.workflowType
          }
        });
      }
      await this.createSnapshot(xSnap.context);
    }

    if ((stateChange && !migration) || (migration && event.target !== xSnap.value)) {
      await DatabaseWrites.productTransitions.deleteMany(
        {
          where: {
            ProductId: this.productId,
            DateTransition: null,
            WorkflowUserId: null,
            UserId: null
          }
        },
        (await DatabaseReads.products.findUnique({
          where: { Id: this.productId },
          select: { ProjectId: true }
        }))!.ProjectId
      );
      // Yes, the ModifyUserTasks will also delete tasks. I just have this here so the tasks are cleared immediately, and so that the tasks are also cleared when the instance is deleted.
      await DatabaseWrites.userTasks.deleteMany({
        where: {
          ProductId: this.productId
        }
      });
      if (!isTerminal(xSnap.value)) {
        // only create snapshot if not in a terminal state
        // deletion handled in state machine definition instead
        await this.createSnapshot(xSnap.context);
        // This will also create the dummy entries in the ProductTransitions table
        await getQueues().UserTasks.add(`Update UserTasks for Product #${this.productId}`, {
          type: BullMQ.JobType.UserTasks_Modify,
          scope: 'Product',
          productId: this.productId,
          comment: jump ? undefined : migration ? '' : event.comment,
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
    const prodDefinition = (await DatabaseReads.products.findUnique({
      where: {
        Id: this.productId
      },
      select: {
        ProductDefinition: {
          select: {
            WorkflowId: true,
            RebuildWorkflowId: true,
            RepublishWorkflowId: true
          }
        }
      }
    }))!.ProductDefinition;
    return DatabaseWrites.workflowInstances.upsert(this.productId, {
      create: {
        State: Workflow.stateName(this.currentState!),
        Context: JSON.stringify(context),
        WorkflowDefinitionId:
          context.workflowType === WorkflowType.Rebuild
            ? prodDefinition.RebuildWorkflowId!
            : context.workflowType === WorkflowType.Republish
              ? prodDefinition.RepublishWorkflowId!
              : prodDefinition.WorkflowId!
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
    filter: WorkflowInput
  ) {
    return Object.values(on)
      .map((v) => v.filter((t) => includeStateOrTransition(filter, t.meta?.includeWhen)))
      .filter((v) => v.length > 0 && includeStateOrTransition(filter, v[0].meta?.includeWhen));
  }

  /** Create ProductTransitions record object */
  private static transitionFromState(
    state: XStateNode<WorkflowContext, WorkflowEvent>,
    productId: string,
    input: WorkflowInput,
    users: Record<string, Set<RoleId>>
  ): Prisma.ProductTransitionsCreateManyInput {
    const t = Workflow.filterTransitions(state.on, input)[0][0];

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
      WorkflowType: input.workflowType
    };
  }

  public static async transitionEntriesFromState(
    stateName: string,
    productId: string,
    input: WorkflowInput
  ): Promise<Prisma.ProductTransitionsCreateManyInput[]> {
    const projectId = (await DatabaseReads.products.findUnique({
      where: {
        Id: productId
      },
      select: {
        ProjectId: true
      }
    }))!.ProjectId;
    const allUsers = await allUsersByRole(projectId);
    const users = Object.fromEntries(
      (
        await DatabaseReads.users.findMany({
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
          ? Workflow.availableTransitionsFromName(WorkflowState.Start, input)[0][0]!.target![0]
          : WorkflowStateMachine.getStateNodeById(Workflow.stateIdFromName(stateName)),
        productId,
        input,
        users
      )
    ];
    while (ret.at(-1)!.DestinationState !== WorkflowState.Published) {
      ret.push(
        Workflow.transitionFromState(
          Workflow.nodeFromName(ret.at(-1)!.DestinationState!),
          productId,
          input,
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
    const transition = await DatabaseReads.productTransitions.findFirst({
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
      ? await DatabaseReads.users.findUnique({
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
          UserId: userId,
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
          UserId: userId,
          WorkflowUserId: user?.WorkflowUserId ?? null,
          AllowedUserNames: user?.Name ?? null,
          InitialState: initialState,
          DestinationState: destinationState,
          Command: command ?? null,
          DateTransition: new Date(),
          Comment: comment ?? null,
          WorkflowType: this.input.workflowType
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
}
