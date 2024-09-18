import type { PageServerLoad, Actions } from './$types';
import { getSnapshot, prisma } from 'sil.appbuilder.portal.common';
import { NoAdminS3 } from 'sil.appbuilder.portal.common';
import { createActor, type Snapshot } from 'xstate';
import { redirect } from '@sveltejs/kit';
import { filterObject } from '$lib/filterObject';

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
            : undefined
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
    //later: filter available actions by user role
    actions: Object.keys(NoAdminS3.getStateNodeById(`${NoAdminS3.id}.${snap.value}`).on),
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
  default: async ({ request }) => {
    // TODO: permission check
    const data = await request.formData();

    //double check that state matches current snapshot

    console.log(data.get('action'));
    console.log(data.get('comment'));

    redirect(302, '/tasks');
  }
} satisfies Actions;
