import { prisma, Workflow } from 'sil.appbuilder.portal.common';
import { WorkflowAction, type WorkflowState } from 'sil.appbuilder.portal.common/workflow';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import type { PageServerLoad, Actions } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import { error } from '@sveltejs/kit';

const jumpStateSchema = v.object({
  state: v.string()
});

export const load: PageServerLoad = async ({ params }) => {
  // route already protected by hooks.server.ts
  const product = await prisma.products.findUnique({
    where: {
      Id: params.product_id
    },
    select: {
      Id: true,
      Store: {
        select: {
          Description: true
        }
      },
      Project: {
        select: {
          Id: true,
          Name: true,
          Organization: {
            select: {
              Id: true,
              Name: true
            }
          }
        }
      },
      ProductDefinition: {
        select: {
          Name: true
        }
      },
      ProductTransitions: {
        select: {
          DateTransition: true,
          DestinationState: true,
          InitialState: true,
          Command: true,
          TransitionType: true,
          WorkflowType: true,
          AllowedUserNames: true,
          Comment: true
        },
        orderBy: [
          {
            DateTransition: 'asc'
          }
        ]
      }
    }
  });

  if (!product) return error(404);

  const flow = await Workflow.restore(params.product_id);

  const snap = await Workflow.getSnapshot(params.product_id);

  const workflowDefinition = await prisma.workflowDefinitions.findUnique({
    where: {
      Id: snap.definitionId
    },
    select: {
      Name: true
    }
  });

  return {
    product: {
      ...product,
      Transitions: product?.ProductTransitions,
      ProductTransitions: undefined
    },
    snapshot: snap,
    machine: snap ? flow.serializeForVisualization() : [],
    definition: workflowDefinition,
    form: await superValidate(
      {
        state: snap?.state
      },
      valibot(jumpStateSchema)
    )
  };
};

export const actions = {
  default: async ({ request, params, locals }) => {
    if (!(await locals.auth())?.user.roles.find((r) => r[1] === RoleId.SuperAdmin)) {
      return error(403);
    }

    const form = await superValidate(request, valibot(jumpStateSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const flow = await Workflow.restore(params.product_id);

    flow.send({
      type: WorkflowAction.Jump,
      target: form.data.state as WorkflowState,
      userId: null
    });

    return { form, ok: true };
  }
} satisfies Actions;
