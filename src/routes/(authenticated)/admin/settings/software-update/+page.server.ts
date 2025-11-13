import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { DatabaseReads } from '$lib/server/database';

const formSchema = v.object({
  comment: v.pipe(v.string(), v.minLength(1, 'Comment is required'))
  //comment: v.nullable(v.string()) /// Use this if you choose to have comment be optional. UI would need to be updated with no validator as well.

  // Since we are only getting a comment, I do not believe we need a properties: propertiesSchema here.
});

export const load = (async ({ url, locals }) => {
  locals.security.requireSuperAdmin();
  const form = await superValidate(valibot(formSchema));
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  async start({ cookies, request, locals }) {
    // This page required users to be an administrator
    locals.security.requireSuperAdmin();
    // Check that form is valid upon submission
    const form = await superValidate(request, valibot(formSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    // TODO: Initiate product rebuilds for projects where setting is selected

    //// Get all products
    // Get what organizations the admin is in
    const orgIds: number[] = locals.security.organizationMemberships;
    // Get list of projects
    const projects = await DatabaseReads.projects.findMany({
      where: {
        OrganizationId: orgIds ? { in: orgIds } : undefined,
        DateArchived: null,
        RebuildOnSoftwareUpdate: true
      },
      include: {
        Products: {
          where: {
            WorkflowInstance: null
          },
          include: {
            ProductDefinition: true,
            WorkflowInstance: true,
            ProductBuilds: {
              orderBy: { DateUpdated: 'desc' },
              take: 1
            }
          }
        },
        Owner: true,
        Group: true,
        Organization: true
      }
    });

    // Await promises for all products running a doProductAction, and stores the comment.
    await Promise.all(
      projects.flatMap((project) =>
        project.Products.map((p) =>
          doProductAction(p.Id, ProductActionType.Rebuild, form.data.comment)
        )
      )
    );

    return { ok: true, form };
  }
} satisfies Actions;
