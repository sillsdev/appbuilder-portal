import type {
  AnyEventObject,
  StateMachineDefinition,
  StateMachine,
  TransitionDefinition,
  TransitionDefinitionMap,
  StateNode as XStateNode
} from 'xstate';
import type { RoleId } from './prisma.js';

export enum ActionType {
  /** Automated Action */
  Auto = 0,
  /** User-initiated Action */
  User
}

export enum AdminLevel {
  /** NoAdmin/OwnerAdmin */
  None = 0,
  /** LowAdmin */
  Low,
  /** Approval required */
  High
}

export enum ProductType {
  Android_GooglePlay = 0,
  Android_S3,
  AssetPackage,
  Web
}

export type StateName =
  | 'Readiness Check'
  | 'Approval'
  | 'Approval Pending'
  | 'Terminated'
  | 'App Builder Configuration'
  | 'Author Configuration'
  | 'Synchronize Data'
  | 'Author Download'
  | 'Author Upload'
  | 'Product Build'
  | 'App Store Preview'
  | 'Create App Store Entry'
  | 'Verify and Publish'
  | 'Product Publish'
  | 'Make It Live'
  | 'Published'
  | 'Product Creation';

export type WorkflowContext = {
  instructions:
    | 'asset_package_verify_and_publish'
    | 'app_configuration'
    | 'create_app_entry'
    | 'authors_download'
    | 'googleplay_configuration'
    | 'googleplay_verify_and_publish'
    | 'make_it_live'
    | 'approval_pending'
    | 'readiness_check'
    | 'synchronize_data'
    | 'authors_upload'
    | 'verify_and_publish'
    | 'waiting'
    | 'web_verify'
    | null;
  includeFields: (
    | 'ownerName'
    | 'ownerEmail'
    | 'storeDescription'
    | 'listingLanguageCode'
    | 'projectURL'
    | 'productDescription'
    | 'appType'
    | 'projectLanguageCode'
  )[];
  includeReviewers: boolean;
  includeArtifacts: 'apk' | 'aab' | boolean;
  start?: StateName;
  productId: string;
  adminLevel: AdminLevel;
  environment: BuildEnv;
  productType: ProductType;
  currentState?: StateName;
};

// These are all specific to the Google Play workflows
// Not sure how these are used, but will figure out when integrating into backend
export type BuildEnv = {
  googlePlayDraft?: boolean;
  googlePlayExisting?: boolean;
  googlePlayUploaded?: boolean;
};

export type WorkflowInput = {
  productId?: string;
  adminLevel?: AdminLevel;
  environment?: BuildEnv;
  productType?: ProductType;
};

/** Used for filtering based on AdminLevel and/or ProductType */
export type MetaFilter = {
  level?: AdminLevel | AdminLevel[];
  product?: ProductType | ProductType[];
};

export type WorkflowStateMeta = MetaFilter;

export type WorkflowTransitionMeta = MetaFilter & {
  type: ActionType;
  user?: RoleId;
};

export type WorkflowMachine = StateMachine<
  WorkflowContext,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  WorkflowInput,
  any,
  any,
  WorkflowStateMeta | WorkflowTransitionMeta,
  any
>;

export type StateNode = {
  id: number;
  label: string;
  connections: { id: number; target: string; label: string }[];
  inCount: number;
  start?: boolean;
  final?: boolean;
  action?: boolean;
};

export function stateName(s: XStateNode<any, any>, machineId: string) {
  return s.id.replace(machineId + '.', '');
}

export function targetStringFromEvent(
  e: TransitionDefinition<any, AnyEventObject>,
  machineId: string
): string {
  return (
    e
      .toJSON()
      .target?.at(0)
      ?.replace('#' + machineId + '.', '') || ''
  );
}

/** 
 * Include state/transition if:
 *  - no conditions are specified 
 *  - OR
 *    - One of the provided admin levels matches the context 
 *    - AND
 *    - One of the provided product types matches the context
*/
export function filterMeta(ctx: WorkflowContext, meta?: MetaFilter) {
  return (
    meta === undefined ||
    ((meta.level !== undefined
      ? Array.isArray(meta.level)
        ? meta.level.includes(ctx.adminLevel)
        : meta.level === ctx.adminLevel
      : true) &&
      (meta.product !== undefined
        ? Array.isArray(meta.product)
          ? meta.product.includes(ctx.productType)
          : meta.product === ctx.productType
        : true))
  );
}

/** Filter a states transitions based on provided context */
export function filterTransitions(
  on: TransitionDefinitionMap<WorkflowContext, any>,
  ctx: WorkflowContext
) {
  return Object.values(on)
    .map((v) => v.filter((t) => filterMeta(ctx, t.meta)))
    .filter((v) => v.length > 0 && filterMeta(ctx, v[0].meta));
}

/** Transform state machine definition into something more easily usable by the visualization algorithm */
export function transform(
  machine: StateMachineDefinition<WorkflowContext, AnyEventObject>,
  ctx: WorkflowContext
): StateNode[] {
  const id = machine.id;
  const states = Object.entries(machine.states).filter(([k, v]) => filterMeta(ctx, v.meta));
  const lookup = states.map((s) => s[0]);
  const actions: StateNode[] = [];
  return states.map(([k, v]) => {
    return {
      id: lookup.indexOf(k),
      label: k,
      connections: filterTransitions(v.on, ctx).map((o) => {
        let target = targetStringFromEvent(o[0], id);
        if (!target) {
          target = o[0].eventType;
          lookup.push(target);
          actions.push({
            id: lookup.lastIndexOf(target),
            label: target,
            connections: [{
              id: lookup.indexOf(k),
              target: k,
              label: ''
            }],
            inCount: 1,
            action: true
          })
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
          return filterTransitions(v.on, ctx).map((e) => {
            // treat no target on transition as self target
            return { from: k, to: targetStringFromEvent(e[0], id) || k };
          });
        })
        .reduce((p, c) => {
          return p.concat(c);
        }, [])
        .filter((v) => k === v.to).length,
      start: k === 'Start',
      final: v.type === 'final'
    } as StateNode;
  }).concat(actions);
}
