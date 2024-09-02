import type { PageServerLoad } from './$types';
import { prisma } from 'sil.appbuilder.portal.common';

type Fields = {
  user?: string;            //Product.Project.Owner.Name
  email?: string;           //Product.Project.Owner.Email
  name: string;             //Product.Project.Name
  description: string;      //Product.Project.Description
  store?: string;           //Product.Store.Description
  listingLanguage?: string; //Product.StoreLanguage.Name
  projectURL?: string;      //Product.Project.WorkflowAppProjectURL
  product?: string;         //Product.ProductDefinition.Description
  appType?: string;         //Product.ProductDefinition.ApplicationTypes.Description
  langCode?: string;        //Product.Project.Language
}

//replace with Product.Project.Reviewers
type User = {
  Id: number;
  Name: string;
  Email: string;
};

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
      user: product?.Project.Owner.Name,
      email: product?.Project.Owner.Email,
      name: product?.Project.Name,
      description: product?.Project.Description,
      store: product?.Store?.Description,
      listingLanguage: product?.StoreLanguage?.Name,
      projectURL: product?.Project.WorkflowAppProjectUrl,
      product: product?.ProductDefinition.Name,
      appType: product?.ProductDefinition.ApplicationTypes.Description,
      langCode: product?.Project.Language
    } as Fields,
    files: product?.ProductArtifacts,
    reviewers: product?.Project.Reviewers
  }
}) satisfies PageServerLoad;