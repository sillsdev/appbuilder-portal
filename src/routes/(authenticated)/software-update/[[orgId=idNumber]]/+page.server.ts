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
  // Since we are only getting a comment, I do not believe we need a properties: propertiesSchema here.
});

export const load = (async ({ url, locals, params }) => {
  const organizationId = Number(params.orgId);
  let searchOrgs: number[] = [];
  if (isNaN(organizationId)) {
    // Organization ID is not specified.
    const orgs = await DatabaseReads.userRoles.findMany({
      where: {
        UserId: locals.security.userId,
        RoleId: { in: [1, 2] } // Must be a super admin or organization admin
      },
      select: { OrganizationId: true }
    });
    // Verify user is admin of organizations selected.
    orgs.forEach((org) => {
      locals.security.requireAdminOfOrg(org.OrganizationId);
      if (!searchOrgs.includes(org.OrganizationId)) searchOrgs.push(org.OrganizationId); // Make sure entries are only added once
    });
  } else {
    // Organization ID is specified.
    locals.security.requireAdminOfOrg(organizationId);
    searchOrgs = [organizationId];
  }

  // Translate organization IDs to names for readability
  const names = await DatabaseReads.organizations.findMany({
    where: {
      Id: { in: searchOrgs }
    },
    select: {
      Name: true
    }
  });
  const organizationsReadable: string[] = [];
  names.forEach((name) => {
    organizationsReadable.push(name.Name ? name.Name : 'Unknown Organization');
  });

  // Check for rebuild status...
  const projects = await DatabaseReads.projects.findMany({
    where: {
      OrganizationId: searchOrgs ? { in: searchOrgs } : undefined,
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
          },
          ProductTransitions: {
            orderBy: { DateTransition: 'desc' },
            take: 1
          }
        }
      },
      Owner: true,
      Group: true,
      Organization: true
    }
  });
  // TODO: Use information from most recent product transition to determine whether to show 'start' or 'pause' on button and action being called.

  const form = await superValidate(valibot(formSchema));
  return { form, organizations: organizationsReadable.join(', ') };
}) satisfies PageServerLoad;

//
//
//
//
//
/// ACTIONS
export const actions = {
  //
  /// START: Starts rebuilds for affected organizations.
  //
  async start({ cookies, request, locals, params }) {
    // Check that form is valid upon submission
    const form = await superValidate(request, valibot(formSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    // Determine what organizations are being affected
    const organizationId = Number(params.orgId);
    let searchOrgs: number[] = [];
    if (isNaN(organizationId)) {
      // IF: Organization ID is not specified.
      const orgs = await DatabaseReads.userRoles.findMany({
        where: {
          UserId: locals.security.userId,
          RoleId: { in: [1, 2] } // Must be a super admin or organization admin
        },
        select: { OrganizationId: true }
      });
      // Verify user is admin of organizations selected and add to list
      orgs.forEach((org) => {
        locals.security.requireAdminOfOrg(org.OrganizationId);
        if (!searchOrgs.includes(org.OrganizationId)) searchOrgs.push(org.OrganizationId); // Make sure entries are only added once
      });
    } else {
      // IF: Organization ID is specified.
      locals.security.requireAdminOfOrg(organizationId);
      searchOrgs = [organizationId];
    }

    // Get list of projects based on organizations
    const projects = await DatabaseReads.projects.findMany({
      where: {
        OrganizationId: searchOrgs ? { in: searchOrgs } : undefined,
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
