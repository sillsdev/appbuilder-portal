import { prisma, NoAdminS3 } from 'sil.appbuilder.portal.common';
import { transform } from 'sil.appbuilder.portal.common/workflow';
import { createActor, type Snapshot } from 'xstate';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const actor = createActor(NoAdminS3, {
    snapshot:
      (JSON.parse(
        (
          await prisma.workflowInstances.findUnique({
            where: {
              ProductId: params.product_id
            },
            select: {
              Snapshot: true
            }
          })
        )?.Snapshot || 'null'
      ) as Snapshot<unknown>) ?? undefined,
    input: {}
  });

  const instance = await prisma.workflowInstances.findUnique({
    where: {
      ProductId: params.product_id
    },
    select: {
      Product: {
        select: {
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
    const data = await request.formData();

    console.log(data.get('state'));
  }
} satisfies Actions;
