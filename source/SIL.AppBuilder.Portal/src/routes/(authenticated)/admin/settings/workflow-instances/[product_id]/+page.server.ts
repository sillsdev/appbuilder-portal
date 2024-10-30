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
  const instance = await prisma.workflowInstances.findUnique({
    where: {
      ProductId: params.product_id
    },
    select: {
      Product: {
        select: {
          Id: true,
          Project: {
            select: {
              Name: true
            }
          },
          ProductDefinition: {
            select: {
              Name: true
            }
          },
          ProductTransitions: {
            where: {
              DateTransition: {
                not: null
              }
            },
            select: {
              DateTransition: true,
              InitialState: true,
              Command: true
            },
            orderBy: [
              {
                DateTransition: 'desc'
              }
            ],
            take: 1
          }
        }
      }
    }
  });

  const flow = await Workflow.restore(params.product_id);

  const snap = await Workflow.getSnapshot(params.product_id);

  return {
    instance: instance,
    snapshot: { value: snap?.value ?? '' },
    machine: snap ? flow.serializeForVisualization() : [],
    form: await superValidate(
      {
        state: snap?.value
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
    // TODO: What if the parent project is archived? This will create user tasks, which we probably don't want.
    flow.send({
      type: WorkflowAction.Jump,
      target: form.data.state as WorkflowState,
      userId: null
    });

    return { form, ok: true };
  }
} satisfies Actions;
