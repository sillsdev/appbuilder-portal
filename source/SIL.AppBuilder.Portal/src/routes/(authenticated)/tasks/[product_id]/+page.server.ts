import type { PageServerLoad } from './$types';

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
  buildId: number;
  type: string;
  size: string;
  url: string;
  id: number;
};

type User = {
  id: number;
  name: string;
  email: string;
};

export const load = (async ({ params, url, locals }) => {
  return {
    actions: [],
    taskTitle: "Waiting",
    instructions: "waiting",
    fields: {
      name: "Test Project",
      description: "a test project"
    } as Fields,
    files: [] as File[],
    reviewers: [] as User[]
  }
}) satisfies PageServerLoad;