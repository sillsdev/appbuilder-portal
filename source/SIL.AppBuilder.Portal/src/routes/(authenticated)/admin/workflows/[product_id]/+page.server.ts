import { prisma, NoAdminS3, getSnapshot } from 'sil.appbuilder.portal.common';
import { transform } from 'sil.appbuilder.portal.common/workflow';
import { createActor, type Snapshot } from 'xstate';
import type { PageServerLoad, Actions } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';

const jumpStateSchema = v.object({
  product: v.string(),
  state: v.string()
});

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const actor = createActor(NoAdminS3, {
    snapshot: await getSnapshot(params.product_id, NoAdminS3),
    input: {}
  });

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
            select: {
              DateTransition: true,
              InitialState: true
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

  const snap = actor.getSnapshot();

  return {
    instance: instance,
    snapshot: { value: snap.value },
    machine: transform(NoAdminS3.toJSON())
  };
};

export const actions = {
  default: async ({ request }) => {
    // TODO: permission check
    const form = await superValidate(request, valibot(jumpStateSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const snap = await getSnapshot(form.data.product, NoAdminS3);

    const actor = createActor(NoAdminS3, {
      snapshot: snap,
      input: {}
    });

    actor.start();

    actor.send({ type: 'Jump To', target: form.data.state });

    return { form, ok: true };
  }
} satisfies Actions;
