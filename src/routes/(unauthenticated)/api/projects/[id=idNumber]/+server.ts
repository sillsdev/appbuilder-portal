export async function GET({ params, locals }) {
  locals.security.requireAuthenticated();
  // ISSUE #1246 Handle can-rebuild attribute here
  return new Response(JSON.stringify({ id: params.id }));
}
