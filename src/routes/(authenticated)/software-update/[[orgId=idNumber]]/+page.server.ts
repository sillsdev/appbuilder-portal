import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad, RouteParams } from './$types';
import { RoleId } from '$lib/prisma';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { DatabaseReads } from '$lib/server/database';

const formSchema = v.object({
  comment: v.pipe(v.string(), v.minLength(1, 'Comment is required'))
  // Since we are only getting a comment, I do not believe we need a properties: propertiesSchema here.
});

/// HELPERS
/**
 * Determines the target organizations based on the user's roles.
 * If the user is a super admin, all organizations are returned.
 * Otherwise, only organizations where the user is an org admin are returned.
 * @param locals The request locals containing security information.
 * @returns An array of organization IDs.
 */
async function determineTargetOrgs(locals: App.Locals): Promise<number[]> {
  const orgs = locals.security.isSuperAdmin
    ? await DatabaseReads.userRoles.findMany({
        select: { OrganizationId: true }
      })
    : await DatabaseReads.userRoles.findMany({
        where: {
          UserId: locals.security.userId,
          RoleId: { in: [RoleId.SuperAdmin, RoleId.OrgAdmin] } // Must be a super admin or organization admin
        },
        select: { OrganizationId: true }
      });
  const searchOrgs = new Set<number>();
  for (const org of orgs) {
    searchOrgs.add(org.OrganizationId);
  }
  return Array.from(searchOrgs);
}

async function getOrganizations(locals: App.Locals, params: RouteParams): Promise<number[]> {
  // Determine what organizations are being affected
  const organizationId = Number(params.orgId);
  const searchOrgs: number[] = isNaN(organizationId)
    ? await determineTargetOrgs(locals)
    : [organizationId];
  return searchOrgs;
}

export const load = (async ({ url, locals, params }) => {
  // Determine what organizations are being affected
  const searchOrgs = await getOrganizations(locals, params);
  if (isNaN(Number(params.orgId))) locals.security.requireAdminOfOrgIn(searchOrgs);
  else locals.security.requireAdminOfOrg(Number(params.orgId));
  // Translate organization IDs to names for readability
  const names = await DatabaseReads.organizations.findMany({
    where: {
      Id: { in: searchOrgs }
    },
    select: {
      Name: true
    }
  });
  const organizationsReadable = names.map((n) => n.Name ?? 'Unknown Organization');

  // TODO: @becca-perk? Use information from most recent product transition to determine whether to show 'start' or 'pause' on button and action being called.
  // Check for rebuild status...
  /*
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
  */

  const form = await superValidate(valibot(formSchema));
  return { form, organizations: organizationsReadable.join(', ') };
}) satisfies PageServerLoad;

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
    const searchOrgs = await getOrganizations(locals, params);
    if (isNaN(Number(params.orgId))) locals.security.requireAdminOfOrgIn(searchOrgs);
    else locals.security.requireAdminOfOrg(Number(params.orgId));

    // Get the current global AppBuilder version (most recent SystemVersions row)
    const systemVersion = await DatabaseReads.systemVersions.findFirst({
      orderBy: { DateCreated: 'desc' }
    });
    const currentAppBuilderVersion = systemVersion?.Version ?? null;

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
            WorkflowInstance: null,
            // If we have a current AppBuilder version, exclude products that are already on it.
            // We exclude products where either VersionBuilt equals the current version OR
            // they have a ProductBuild with that Version.
            ...(currentAppBuilderVersion
              ? {
                  NOT: [
                    { VersionBuilt: currentAppBuilderVersion },
                    { ProductBuilds: { some: { Version: currentAppBuilderVersion } } }
                  ]
                }
              : {})
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
      // Could use Promise.allSettled for better resiliency if needed
      projects.flatMap((project) =>
        project.Products.map((p) =>
          doProductAction(p.Id, ProductActionType.Rebuild, form.data.comment)
        )
      )
    );

    return { ok: true, form };
  }
} satisfies Actions;
