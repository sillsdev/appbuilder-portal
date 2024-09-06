import type { PageServerLoad } from './$types';
import { prisma } from 'sil.appbuilder.portal.common';

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
      // later: include only when workflow state needs it
      // later: ProductArtifacts should be filtered based on Products.WorkflowBuildId = ProductArtifacts.ProductBuildId
      // later: some forms don't need all artifacts, some just need aab
      ProductArtifacts: {
        select: {
          ProductBuildId: true,
          ContentType: true,
          FileSize: true,
          Url: true,
          Id: true
        }
      }
    }
  });

  return {
    actions: [],
    taskTitle: "Waiting",
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
    files: product?.ProductArtifacts,
    reviewers: product?.Project.Reviewers
  }
}) satisfies PageServerLoad;