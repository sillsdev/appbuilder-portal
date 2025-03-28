import { localizeHref } from '$lib/paraglide/runtime';
import { redirect } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
  const id = parseInt(event.params.id);
  if (isNaN(id)) return redirect(302, localizeHref('/organizations'));
  const organization = await prisma.organizations.findUnique({
    where: {
      Id: id
    }
  });
  if (!organization) return redirect(302, localizeHref('/organizations'));
  return { organization };
}) satisfies LayoutServerLoad;
