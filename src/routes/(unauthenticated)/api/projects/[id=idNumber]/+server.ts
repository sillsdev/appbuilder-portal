import { json } from '@sveltejs/kit';

export async function GET({ params, locals }) {
  locals.security.requireApiToken();
  // ISSUE #1246 Handle can-rebuild attribute here
  return json({ id: params.id, 'can-rebuild': true });
}
