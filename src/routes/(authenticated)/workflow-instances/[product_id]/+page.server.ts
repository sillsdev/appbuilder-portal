import { error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { getURLandToken } from '$lib/server/build-engine-api/requests';
import { QueueConnected } from '$lib/server/bullmq';
import { DatabaseReads } from '$lib/server/database';
import { Workflow } from '$lib/server/workflow';
import { WorkflowAction, type WorkflowState } from '$lib/workflowTypes';

const jumpStateSchema = v.object({
  state: v.string()
});

export const load: PageServerLoad = async ({ params, locals }) => {
  locals.security.requireSuperAdmin();
  const product = await DatabaseReads.products.findUnique({
    where: {
      Id: params.product_id
    },
    select: {
      Id: true,
      BuildEngineJobId: true,
      CurrentBuildId: true,
      CurrentReleaseId: true,
      ProductBuilds: {
        select: {
          BuildEngineBuildId: true,
          TransitionId: true
        },
        orderBy: {
          DateCreated: 'desc'
        }
      },
      ProductPublications: {
        select: {
          BuildEngineReleaseId: true,
          TransitionId: true
        },
        orderBy: {
          DateCreated: 'desc'
        }
      },
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
              Name: true,
              BuildEngineUrl: true,
              BuildEngineApiAccessToken: true,
              UseDefaultBuildEngine: true
            }
          }
        }
      },
      ProductDefinition: {
        select: {
          Name: true
        }
      }
    }
  });

  if (!product) return error(404);

  const flow = await Workflow.restore(params.product_id);

  const snap = await Workflow.getSnapshot(params.product_id);
  if (!(flow && snap)) return error(404);

  const workflowDefinition = await DatabaseReads.workflowDefinitions.findUnique({
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
      BuildEngineUrl: getURLandToken(product.Project.Organization).url ?? undefined
    },
    snapshot: snap,
    machine: snap ? flow.serializeForVisualization() : [],
    definition: workflowDefinition,
    form: await superValidate(
      {
        state: snap?.state
      },
      valibot(jumpStateSchema)
    ),
    transitions: await DatabaseReads.productTransitions.findMany({
      where: { ProductId: params.product_id },
      select: {
        Id: true,
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
        },
        QueueRecords: {
          select: {
            Queue: true,
            JobId: true,
            JobType: true
          }
        }
      },
      orderBy: [
        {
          DateTransition: 'asc'
        },
        {
          Id: 'asc'
        }
      ]
    }),
    jobsAvailable: QueueConnected()
  };
};

export const actions = {
  default: async ({ request, params, locals }) => {
    locals.security.requireSuperAdmin();
    const form = await superValidate(request, valibot(jumpStateSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    if (!QueueConnected()) return error(503);

    const flow = await Workflow.restore(params.product_id);

    if (!flow) return fail(404, { form, ok: false });

    flow.send({
      type: WorkflowAction.Jump,
      target: form.data.state as WorkflowState
    });

    return { form, ok: true };
  }
} satisfies Actions;
