import DatabaseWrites from '../databaseProxy/index.js';
import { prisma } from '../index.js';
import { WorkflowContext } from '../public/workflow.js';
import { AnyStateMachine } from 'xstate';

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
