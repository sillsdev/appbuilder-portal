import { json } from '@sveltejs/kit';
import * as v from 'valibot';
import { createAppBuildersError } from '../common';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { JSONStringSchema } from '$lib/valibot';

const bodySchema = v.object({
  properties: v.nullable(JSONStringSchema)
});

export async function POST({ params, locals, request }) {
  // Validate API token and get user ID
  try {
    locals.security.requireApiToken();
  } catch {
    return createAppBuildersError(401, 'Login timed out');
  }
  const userId = locals.security.userId;

  const projectId = parseInt(params.id);

  // Fetch project and owner
  const project = await DatabaseReads.projects.findFirst({
    where: {
      Id: projectId,
      // Enforces ownership
      Owner: { Id: userId }
    },
    select: {
      Owner: { select: { Id: true } }
    }
  });

  if (!project) {
    return createAppBuildersError(404, `Project id=${projectId} not found or access denied`);
  }

  let props: string | null = null;

  try {
    const parsed = v.safeParse(bodySchema, await request.json());
    if (parsed.success && parsed.output) {
      props = parsed.output.properties;
    }
  } catch {
    return createAppBuildersError(400, `Error validating request body`);
  }

  if (props) {
    await DatabaseWrites.projects.update(projectId, { Properties: props });
  }

  return json({
    message: `Successfully updated publishing-properties`
  });
}
