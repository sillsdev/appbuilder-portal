import type { PageServerLoad } from './$types';
import { prisma } from 'sil.appbuilder.portal.common';

type Fields = {
  user?: string;
  email?: string;
  name: string;
  description: string;
  store?: string;
  listingLanguage?: string;
  projectURL?: string;
  product?: string;
  appType?: string;
  langCode?: string;
}

type File = {
  BuildId: number;
  Type: string;
  Size: string;
  URL: string;
  Id: number;
};

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