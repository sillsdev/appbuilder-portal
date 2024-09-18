import type {
  AnyEventObject,
  StateMachineDefinition,
  TransitionDefinition,
  StateNode as XStateNode
} from 'xstate';

export type WorkflowContext = {
  //later: narrow types if necessary
  instructions: string;
  includeFields: string[];
  includeReviewers: boolean;
  includeArtifacts: string | boolean;
  start?: string;
  productId: string;
};

export type WorkflowInput = {
  productId?: string;
};

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
  e: TransitionDefinition<any, AnyEventObject>[],
  machineId: string
): string {
  return (
    e[0]
      .toJSON()
      .target?.at(0)
      ?.replace('#' + machineId + '.', '') ?? ''
  );
}

export function transform(machine: StateMachineDefinition<any, AnyEventObject>): StateNode[] {
  const id = machine.id;
  const lookup = Object.keys(machine.states);
  const a = Object.entries(machine.states).map(([k, v]) => {
    return {
      id: lookup.indexOf(k),
      label: k,
      connections: Object.values(v.on).map((o) => {
        return {
          id: lookup.indexOf(targetStringFromEvent(o, id)),
          target: targetStringFromEvent(o, id),
          label: o[0].eventType
        };
      }),
      inCount: Object.entries(machine.states)
        .map(([k, v]) => {
          return Object.values(v.on).map((e) => {
            // treat no target on transition as self target
            return { from: k, to: targetStringFromEvent(e, id) || k };
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
