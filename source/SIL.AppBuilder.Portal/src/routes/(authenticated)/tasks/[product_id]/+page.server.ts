import type { PageServerLoad, Actions } from './$types';
import { getSnapshot, prisma } from 'sil.appbuilder.portal.common';
import { NoAdminS3 } from 'sil.appbuilder.portal.common';
import { createActor, type Snapshot } from 'xstate';
import { redirect } from '@sveltejs/kit';
import { filterObject } from '$lib/filterObject';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';

const sendActionSchema = v.object({
  state: v.string(),
  action: v.string(),
  comment: v.string()
});

type Fields = {
  ownerName?: string; //Product.Project.Owner.Name
  ownerEmail?: string; //Product.Project.Owner.Email
  projectName: string; //Product.Project.Name
  projectDescription: string; //Product.Project.Description
  storeDescription?: string; //Product.Store.Description
  listingLanguageCode?: string; //Product.StoreLanguage.Name
  projectURL?: string; //Product.Project.WorkflowAppProjectURL
  productDescription?: string; //Product.ProductDefinition.Description
  appType?: string; //Product.ProductDefinition.ApplicationTypes.Description
  projectLanguageCode?: string; //Product.Project.Language
};

export const load = (async ({ params, url, locals }) => {
  const session = await locals.auth();
  // TODO: permission check
  const actor = createActor(NoAdminS3, {
    snapshot: await getSnapshot(params.product_id, NoAdminS3),
    input: {}
  });
  const snap = actor.getSnapshot();

  const product = await prisma.products.findUnique({
    where: {
      Id: params.product_id
    },
    select: {
      WorkflowBuildId: true,
      Project: {
        select: {
          Name: true,
          Description: true,
          WorkflowAppProjectUrl: true,
          Language: true,
          Owner: {
            select: {
              Id: true,
              Name: true,
              Email: true
            }
          },
          //conditionally include reviewers
          Reviewers: snap.context.includeReviewers
            ? {
                select: {
                  Id: true,
                  Name: true,
                  Email: true
                }
              }
            : undefined,
          Authors: {
            select: {
              UserId: true
            }
          },
          Organization: {
            select: {
              UserRoles: {
                where: {
                  RoleId: RoleId.OrgAdmin
                }
              }
            }
          }
        }
      },
      Store: {
        select: {
          Description: true
        }
      },
      StoreLanguage: {
        select: {
          Name: true
        }
      },
      ProductDefinition: {
        select: {
          Name: true,
          ApplicationTypes: {
            select: {
              Description: true
            }
          }
        }
      }
    }
  });

  const artifacts = snap.context.includeArtifacts
    ? await prisma.productArtifacts.findMany({
        where: {
          ProductId: params.product_id,
          ProductBuild: {
            BuildId: product?.WorkflowBuildId
          },
          //filter by artifact type
          ArtifactType:
            typeof snap.context.includeArtifacts === 'string'
              ? snap.context.includeArtifacts
              : undefined //include all
        },
        select: {
          ProductBuildId: true,
          ContentType: true,
          FileSize: true,
          Url: true,
          Id: true
        }
      })
    : [];

  const fields = snap.context.includeFields;

  return {
    actions: Object.keys(NoAdminS3.getStateNodeById(`${NoAdminS3.id}.${snap.value}`).on).filter((a) => {
      if (session?.user.userId === undefined) return false;
      switch(a.split(":")[1]) {
        case 'Owner':
          return session.user.userId === product?.Project.Owner.Id;
        case 'Author':
          return product?.Project.Authors.map((a) => a.UserId).includes(session.user.userId);
        case 'Admin':
          return product?.Project.Organization.UserRoles.map((u) => u.UserId).includes(session.user.userId);
        default:
          return false;
      }
    }).map((a) => a.split(":")),
    taskTitle: snap.value,
    instructions: snap.context.instructions,
    //filter fields/files/reviewers based on task once workflows are implemented
    //possibly filter in the original query to increase database efficiency
    fields: {
      ...filterObject(
        {
          ownerName: product?.Project.Owner.Name,
          ownerEmail: product?.Project.Owner.Email,
          storeDescription: product?.Store?.Description,
          listingLanguageCode: product?.StoreLanguage?.Name,
          projectURL: product?.Project.WorkflowAppProjectUrl,
          productDescription: product?.ProductDefinition.Name,
          appType: product?.ProductDefinition.ApplicationTypes.Description,
          projectLanguageCode: product?.Project.Language
        },
        ([k, v]) => {
          return fields.includes(k);
        }
      ),
      projectName: product?.Project.Name,
      projectDescription: product?.Project.Description
    } as Fields,
    files: artifacts,
    reviewers: product?.Project.Reviewers
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, params }) => {
    // TODO: permission check
    const form = await superValidate(request, valibot(sendActionSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const snap = await getSnapshot(params.product_id, NoAdminS3);

    const actor = createActor(NoAdminS3, {
      snapshot: snap,
      input: {}
    });

    actor.start();

    //double check that state matches current snapshot
    if (form.data.state === actor.getSnapshot().value) {
      const action = Object.keys(NoAdminS3.getStateNodeById(`${NoAdminS3.id}.${actor.getSnapshot().value}`).on).filter((a) => a.split(":")[0] === form.data.action);
      actor.send({ type: action[0], comment: form.data.comment });
    }

    redirect(302, '/tasks');
  }
} satisfies Actions;
