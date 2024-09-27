import { DefaultWorkflow } from './default-workflow.js';
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
  WorkflowInput,
  WorkflowAdminLevel,
  ProductType,
  ActionType,
  StateNode,
  WorkflowEvent,
  MetaFilter,
  WorkflowTransitionMeta
} from '../public/workflow.js';
import prisma from '../prisma.js';
import { RoleId, ProductTransitionType } from '../public/prisma.js';

type Snapshot = {
  value: string;
  context: WorkflowContext;
  input: WorkflowInput;
};

export class Workflow {
  private flow: Actor<typeof DefaultWorkflow> | null;
  private productId: string;
  private currentState: XStateNode<WorkflowContext, WorkflowEvent> | null;
  private adminLevel: WorkflowAdminLevel;
  private productType: ProductType;

  constructor(productId: string) {
    this.productId = productId;
    this.currentState = null;
    this.flow = null;
  }

  /* PUBLIC METHODS */
  /** Creat a new workflow instance */
  public async create(input: WorkflowInput, productId?: string): Promise<void> {
    this.flow?.stop();
    this.currentState = null;
    this.productId = productId ?? this.productId;
    this.adminLevel = input.adminLevel;
    this.productType = input.productType;

    DatabaseWrites.workflowInstances.upsert({
      where: {
        ProductId: this.productId
      },
      update: {},
      create: {
        Snapshot: '',
        ProductId: this.productId
      }
    });

    this.flow = createActor(DefaultWorkflow, {
      inspect: (e) => {
        if (e.type === '@xstate.snapshot') this.inspect(e);
      },
      input: input
    });

    this.flow.start();
  }
  /** Restore from a workflow instance */
  public async restore(): Promise<void> {
    this.flow?.stop();
    this.currentState = null;
    const snap = await this.getSnapshot();
    this.flow = createActor(DefaultWorkflow, {
      snapshot: snap ? DefaultWorkflow.resolveState(snap) : undefined,
      inspect: (e) => {
        if (e.type === '@xstate.snapshot') this.inspect(e);
      },
      input: snap.input
    });

    this.flow.start();
  }

  public async send(event: WorkflowEvent): Promise<void> {
    this.flow?.send(event);
  }

  public stop(): void {
    this.flow?.stop();
  }

  public async getSnapshot(): Promise<Snapshot> {
    const snap = JSON.parse(
      (
        await prisma.workflowInstances.findUnique({
          where: {
            ProductId: this.productId
          },
          select: {
            Snapshot: true
          }
        })
      )?.Snapshot || 'null'
    ) as Snapshot | null;
    this.adminLevel = snap?.input.adminLevel;
    this.productType = snap?.input.productType;
    return snap;
  }

  public state() {
    return this.flow?.getSnapshot().value;
  }

  public availableTransitions(): TransitionDefinition<WorkflowContext, WorkflowEvent>[][] {
    return this.currentState !== null ? this.filterTransitions(this.currentState.on) : [];
  }

  /** Transform state machine definition into something more easily usable by the visualization algorithm */
  public serializeForVisualization(): StateNode[] {
    const machine = DefaultWorkflow;
    const states = Object.entries(machine.states).filter(([k, v]) => this.filterMeta(v.meta));
    const lookup = states.map((s) => s[0]);
    const actions: StateNode[] = [];
    return states
      .map(([k, v]) => {
        return {
          id: lookup.indexOf(k),
          label: k,
          connections: this.filterTransitions(v.on).map((o) => {
            let target = this.targetStringFromEvent(o[0]);
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
              return this.filterTransitions(v.on).map((e) => {
                // treat no target on transition as self target
                return { from: k, to: this.targetStringFromEvent(e[0]) || k };
              });
            })
            .reduce((p, c) => {
              return p.concat(c);
            }, [])
            .filter((v) => k === v.to).length,
          start: k === 'Start',
          final: v.type === 'final'
        } as StateNode;
      })
      .concat(actions);
  }

  /* PRIVATE METHODS */
  private async inspect(event: InspectedSnapshotEvent): Promise<void> {
    const old = this.currentState;
    const snap = this.flow.getSnapshot();
    this.currentState = DefaultWorkflow.getStateNodeById(`#${DefaultWorkflow.id}.${snap.value}`);

    if (old && this.stateName(old) !== snap.value) {
      await this.updateProductTransitions(
        event.event.userId,
        this.stateName(old),
        this.stateName(this.currentState),
        event.event.type,
        event.event.comment || undefined
      );
    }

    await this.createSnapshot(snap.context);
    if (old && this.stateName(old) !== snap.value) {
      await this.updateUserTasks(event.event.comment || undefined);
    }
  }

  private async createSnapshot(context: WorkflowContext) {
    return DatabaseWrites.workflowInstances.update({
      where: {
        ProductId: this.productId
      },
      data: {
        Snapshot: JSON.stringify({
          value: this.stateName(this.currentState),
          context: context,
          input: {
            adminLevel: this.adminLevel,
            productType: this.productType
          }
        } as Snapshot)
      }
    });
  }

  /** Filter a states transitions based on provided context */
  private filterTransitions(on: TransitionDefinitionMap<WorkflowContext, WorkflowEvent>) {
    return Object.values(on)
      .map((v) => v.filter((t) => this.filterMeta(t.meta)))
      .filter((v) => v.length > 0 && this.filterMeta(v[0].meta));
  }

  /**
   * Include state/transition if:
   *  - no conditions are specified
   *  - OR
   *    - One of the provided admin levels matches the context
   *    - AND
   *    - One of the provided product types matches the context
   */
  private filterMeta(meta?: MetaFilter) {
    return (
      meta === undefined ||
      ((meta.level !== undefined ? meta.level.includes(this.adminLevel) : true) &&
        (meta.product !== undefined ? meta.product.includes(this.productType) : true))
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

    const uids = this.availableTransitions()
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

    const timestamp = new Date();

    return DatabaseWrites.userTasks.createMany({
      data: uids.map((u) => ({
        UserId: u,
        ProductId: this.productId,
        ActivityName: this.stateName(this.currentState),
        Status: this.stateName(this.currentState),
        Comment: comment ?? null,
        DateCreated: timestamp,
        DateUpdated: timestamp
      }))
    });
  }

  /** Create ProductTransitions record object */
  private transitionFromState(state: XStateNode<WorkflowContext, any>) {
    const t = this.filterTransitions(state.on)[0][0];
    return {
      ProductId: this.productId,
      TransitionType: ProductTransitionType.Activity,
      InitialState: this.stateName(state),
      DestinationState: this.targetStringFromEvent(t),
      Command: t.meta.type !== ActionType.Auto ? t.eventType : null
    };
  }

  /** Create ProductTransitions entries for new product following the "happy" path */
  private async populateTransitions() {
    return DatabaseWrites.productTransitions.createManyAndReturn({
      data: [
        {
          ProductId: this.productId,
          DateTransition: new Date(),
          TransitionType: ProductTransitionType.StartWorkflow
        }
      ].concat(
        Object.entries(DefaultWorkflow.states).reduce(
          (p, [k, v], i) =>
            p.concat(
              this.filterMeta(v.meta) &&
                (i === 1 ||
                  (i > 1 && p[p.length - 1]?.DestinationState === k && v.type !== 'final'))
                ? [this.transitionFromState(v)]
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
  private async updateProductTransitions(
    userId: number | null,
    initialState: string,
    destinationState: string,
    command?: string,
    comment?: string
  ) {
    const transitions = await prisma.productTransitions.count({
      where: {
        ProductId: this.productId
      }
    });
    if (transitions <= 0) {
      await this.populateTransitions();
    }
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

  private stateName(s: XStateNode<any, any>): string {
    return s.id.replace(DefaultWorkflow.id + '.', '');
  }

  private targetStringFromEvent(e: TransitionDefinition<any, any>): string {
    return (
      e
        .toJSON()
        .target?.at(0)
        ?.replace('#' + DefaultWorkflow.id + '.', '') || ''
    );
  }
}
