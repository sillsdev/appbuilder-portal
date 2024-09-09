import type { PageServerLoad, Actions } from './$types';
import { prisma } from 'sil.appbuilder.portal.common';
import { NoAdminS3 } from 'sil.appbuilder.portal.common/workflow';
import { createActor } from 'xstate';
import { redirect } from '@sveltejs/kit';

const actor = createActor(NoAdminS3); //later: retrieve snapshot from database

type Fields = {
  ownerName?: string;           //Product.Project.Owner.Name
  ownerEmail?: string;          //Product.Project.Owner.Email
  projectName: string;          //Product.Project.Name
  projectDescription: string;   //Product.Project.Description
  storeDescription?: string;    //Product.Store.Description
  listingLanguageCode?: string; //Product.StoreLanguage.Name
  projectURL?: string;          //Product.Project.WorkflowAppProjectURL
  productDescription?: string;  //Product.ProductDefinition.Description
  appType?: string;             //Product.ProductDefinition.ApplicationTypes.Description
  projectLanguageCode?: string; //Product.Project.Language
}

export const load = (async ({ params, url, locals }) => {
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
          Reviewers: {
            select: {
              Id: true,
              Name: true,
              Email: true
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
      },
    }
  });
  
  // later: include only when workflow state needs it
  const artifacts = await prisma.productArtifacts.findMany({
    where: {
      ProductId: params.product_id,
      ProductBuild: {
        BuildId: product?.WorkflowBuildId
      }
      // later: some forms don't need all artifacts, some just need aab
    },
    select: {
      ProductBuildId: true,
      ContentType: true,
      FileSize: true,
      Url: true,
      Id: true
    }
  })

  return {
    actions: Object.keys(NoAdminS3.getStateNodeById(`(machine).${actor.getSnapshot().value}`).on),
    taskTitle: actor.getSnapshot().value,
    instructions: "waiting",
    //filter fields/files/reviewers based on task once workflows are implemented
    //possibly filter in the original query to increase database efficiency
    fields: {
      ownerName: product?.Project.Owner.Name,
      ownerEmail: product?.Project.Owner.Email,
      projectName: product?.Project.Name,
      projectDescription: product?.Project.Description,
      storeDescription: product?.Store?.Description,
      listingLanguageCode: product?.StoreLanguage?.Name,
      projectURL: product?.Project.WorkflowAppProjectUrl,
      productDescription: product?.ProductDefinition.Name,
      appType: product?.ProductDefinition.ApplicationTypes.Description,
      projectLanguageCode: product?.Project.Language
    } as Fields,
    files: artifacts,
    reviewers: product?.Project.Reviewers
  }
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    console.log(data.get('action'));
    console.log(data.get('comment'));

    redirect(302, '/tasks');
  }
} satisfies Actions;