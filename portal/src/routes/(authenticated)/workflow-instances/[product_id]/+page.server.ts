import { isSuperAdmin } from '$lib/utils/roles';
import { error } from '@sveltejs/kit';
import { prisma, Workflow } from 'sil.appbuilder.portal.common';
import { WorkflowAction, type WorkflowState } from 'sil.appbuilder.portal.common/workflow';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

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
          Comment: true,
          User: {
            select: {
              Name: true
            }
          }
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
  if (!(flow && snap)) return error(404);

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
    if (!isSuperAdmin((await locals.auth())?.user.roles)) {
      return error(403);
    }

    const form = await superValidate(request, valibot(jumpStateSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const flow = await Workflow.restore(params.product_id);

    if (!flow) return fail(404, { form, ok: false });

    // TODO: What if the parent project is archived? This will create user tasks, which we probably don't want.
    flow.send({
      type: WorkflowAction.Jump,
      target: form.data.state as WorkflowState,
      userId: null
    });

    return { form, ok: true };
  }
} satisfies Actions;
