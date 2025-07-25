import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';

// This is an empty page that exists solely to handle specific error states from the handle functions
export const load: PageServerLoad = async (event) => {
  const code = parseInt(event.url.searchParams.get('code') ?? '');
  if (!isNaN(code)) {
    return error(code);
  }
  return redirect(302, localizeHref('/tasks'));
};
