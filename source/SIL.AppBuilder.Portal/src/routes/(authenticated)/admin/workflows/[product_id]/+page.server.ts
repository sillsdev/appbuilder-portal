import { prisma, Workflow } from 'sil.appbuilder.portal.common';
import { type StateName } from 'sil.appbuilder.portal.common/workflow';
import type { PageServerLoad, Actions } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';

const jumpStateSchema = v.object({
  state: v.string()
});

export const load: PageServerLoad = async ({ params, url, locals }) => {
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

  const flow = new Workflow(params.product_id);

  const snap = await flow.getSnapshot();

  return {
    instance: instance,
    snapshot: { value: snap?.value ?? '' },
    machine: snap ? flow.serializeForVisualization() : []
  };
};

export const actions = {
  default: async ({ request, params }) => {
    // TODO: permission check
    const form = await superValidate(request, valibot(jumpStateSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const flow = new Workflow(params.product_id);
    await flow.restore();

    flow.send({
      type: 'Jump',
      target: form.data.state as StateName,
      userId: null
    });

    return { form, ok: true };
  }
} satisfies Actions;
