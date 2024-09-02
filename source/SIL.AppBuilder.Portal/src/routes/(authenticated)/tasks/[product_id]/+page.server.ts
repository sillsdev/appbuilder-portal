import type { PageServerLoad } from './$types';
import { prisma } from 'sil.appbuilder.portal.common';

type Fields = {
  user?: string;            //Product.Project.Owner.Name
  email?: string;           //Product.Project.Owner.Email
  name: string;             //Product.Project.Name
  description: string;      //Product.Project.Description
  store?: string;           //Product.Store.Name
  listingLanguage?: string; //Product.StoreLanguage.Name
  projectURL?: string;      //Product.Project.WorkflowAppProjectURL?
  product?: string;         //Product.ProductDefinition.Name?
  appType?: string;         //Product.ProductDefinition.ApplicationTypes.Name
  langCode?: string;        //Product.Project.Language?
}

//replace with Product.ProductArtifacts
type File = {
  BuildId: number;
  Type: string;
  Size: string;
  URL: string;
  Id: number;
};

//replace with Product.Project.Reviewers
type User = {
  Id: number;
  Name: string;
  Email: string;
};

export const load = (async ({ params, url, locals }) => {
  const userInfo = (await locals.auth())?.user;
  console.log(userInfo);

  const products = await prisma.products.findMany();
  console.log(products);
  return {
    actions: [],
    taskTitle: "Waiting",
    instructions: "waiting",
    //filter fields based on task
    fields: {
      name: "Test Project",
      description: "a test project"
    } as Fields,
    files: [] as File[],
    reviewers: [] as User[]
  }
}) satisfies PageServerLoad;