import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads } from '$lib/server/database';

export const load = (async (event) => {
  const id = parseInt(event.params.id);
  event.locals.security.requireAdminOfOrg(id);
  const organization = await DatabaseReads.organizations.findUnique({
    where: {
      Id: id
    }
  });
  if (!organization) return redirect(302, localizeHref('/organizations'));
  return { organization };
}) satisfies LayoutServerLoad;
