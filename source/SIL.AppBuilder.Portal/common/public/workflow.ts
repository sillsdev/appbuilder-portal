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
  Auto = 0,
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
  | 'Set Google Play Existing'
  | 'App Store Preview'
  | 'Create App Store Entry'
  | 'Set Google Play Uploaded'
  | 'Verify and Publish'
  | 'Email Reviewers'
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
  environment: { [key: string]: any };
  productType: ProductType;
  currentState?: StateName;
};

export type WorkflowInput = {
  productId?: string;
  adminLevel?: AdminLevel;
  environment?: { [key: string]: any };
  productType?: ProductType;
};

export type WorkflowStateMeta = {
  level?: AdminLevel | AdminLevel[];
  product?: ProductType | ProductType[];
};

export type WorkflowTransitionMeta = {
  type: ActionType;
  user?: RoleId;
  level?: AdminLevel | AdminLevel[];
  product?: ProductType | ProductType[];
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
  start: boolean;
  final: boolean;
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

export function filterMeta(
  meta: WorkflowStateMeta | WorkflowTransitionMeta | undefined,
  ctx: WorkflowContext
) {
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

export function filterTransitions(
  on: TransitionDefinitionMap<WorkflowContext, any>,
  ctx: WorkflowContext
) {
  return Object.values(on)
    .map((v) => v.filter((t) => filterMeta(t.meta, ctx)))
    .filter((v) => v.length > 0 && filterMeta(v[0].meta, ctx));
}

export function transform(
  machine: StateMachineDefinition<WorkflowContext, AnyEventObject>,
  ctx: WorkflowContext
): StateNode[] {
  const id = machine.id;
  const states = Object.entries(machine.states).filter(([k, v]) => filterMeta(v.meta, ctx));
  const lookup = states.map((s) => s[0]);
  const a = states.map(([k, v]) => {
    return {
      id: lookup.indexOf(k),
      label: k,
      connections: filterTransitions(v.on, ctx).map((o) => {
        return {
          // treat no target on transition as self target
          id: lookup.indexOf(targetStringFromEvent(o[0], id) || k),
          target: targetStringFromEvent(o[0], id) || k,
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
    };
  });
  return a;
}
