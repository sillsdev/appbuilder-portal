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

export const load = (async ({ params, url, locals }) => {
  return {
    actions: [],
    taskTitle: "Waiting",
    instructions: "waiting",
    fields: {
      name: "Test Project",
      description: "a test project"
    } as Fields,
    files: [],
    reviewers: []
  }
}) satisfies PageServerLoad;