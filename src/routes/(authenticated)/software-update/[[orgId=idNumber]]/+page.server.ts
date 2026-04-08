import { fail } from '@sveltejs/kit';
import { Prisma, PrismaClient } from '@prisma/client';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { BuildEngine } from '$lib/server/build-engine-api';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { getRebuildsForOrgIds } from '$lib/software-updates/sse';
import { filterAdminOrgs } from '$lib/utils/roles';

interface ProductToRebuild {
  id: string; // Product ID (UUID)
  latestVersion: string | null;
  requiredVersion: string | null;
  projectId: number;
  projectName: string;
  applicationTypeId: number;
  buildEngineUrl: string;
  organizationId: number;
}

/**
 * Fetches products that need to be rebuilt based on the provided organizations.
 * Checks to make sure the product is part of a project that has rebuildOnSoftwareUpdate enabled,
 * and that the latest product build's AppBuilderVersion does not match the required SystemVersion.
 * @param searchOrgs An array or organizations to include products from.
 * @param selectedTypeIds Optional array of ApplicationTypeIds to filter by. If provided, only products with these types are returned.
 * @returns Array of Products
 */
async function getProductsForRebuild(
  searchOrgs: number[],
  selectedTypeIds?: number[]
): Promise<ProductToRebuild[]> {

  // Get system versions into a table.
  let systemVersions = (await DatabaseReads.systemVersions.findMany(
    {
      select: {
        BuildEngineUrl: true,
        ApplicationTypeId: true,
        Version: true
      }
    })).reduce((acc, v) => {

      if (!acc[v.BuildEngineUrl]) {
        acc[v.BuildEngineUrl] = {};
      }

      acc[v.BuildEngineUrl][v.ApplicationTypeId] = v.Version;
      return acc;
    }, {});

  // Get products eligible to rebuild.
  // If a product's latest rebuild does not use its current build engine's version, it needs to be rebuilt.
  const eligibleProducts = (await DatabaseReads.products.findMany({
    where: {
      Project: {
        OrganizationId: { in: searchOrgs },
        DateArchived: null, // Project has not been archived
        RebuildOnSoftwareUpdate: true, // Project setting is true
        ...(selectedTypeIds && selectedTypeIds.length > 0 && { TypeId: { in: selectedTypeIds } })
      },
      WorkflowInstance: null, // Only products without active workflows
      DatePublished: { not: null } // Only products that have been published at least once
    },
    select: {
      Id: true,
      ProjectId: true,
      ProductBuilds: {
        orderBy: { DateCreated: 'desc' },
        take: 1, // Only take the most recent
        select: {
          AppBuilderVersion: true
        }
      },
      Project: {
        select: {
          TypeId: true,
          Name: true,
          OrganizationId: true,
          Organization: {
            select: {
              BuildEngineUrl: true
            }
          },
        }
      }
    }
  })).map((product) => {
    const buildEngineUrl = product.Project.Organization.BuildEngineUrl ?? '';
    const organizationId = product.Project.OrganizationId;
    const latestVersion = product.ProductBuilds[0]?.AppBuilderVersion ?? null;
    const requiredVersion = systemVersions[buildEngineUrl][organizationId.toString()] ?? null;
    return {
      id: product.Id,
      projectId: product.ProjectId,
      projectName: product.Project.Name ?? '',
      applicationTypeId: product.Project.TypeId,
      buildEngineUrl,
      organizationId,
      latestVersion,
      requiredVersion,
    };
  }).filter((product) => product.requiredVersion !== product.latestVersion);

  return eligibleProducts;
}

const formSchema = v.object({
  comment: v.pipe(v.string(), v.minLength(1)),
  applicationTypeIds: v.pipe(v.array(v.number()), v.minLength(1))
});

export const load = (async ({ locals, params }) => {
  if (params.orgId) {
    locals.security.requireAdminOfOrg(Number(params.orgId));
  } else {
    locals.security.requireAdminOfAny();
  }

  // Determine what organizations are being affected and fetch their names.
  const organizationIds = (await DatabaseReads.organizations.findMany({
    where: filterAdminOrgs(locals.security, params.orgId ? Number(params.orgId) : undefined),
    select: {
      Id: true,
    }
  })).map((o) => o.Id);

  let systemVersions = (await DatabaseReads.systemVersions.findMany(
    {
      select: {
        BuildEngineUrl: true,
        ApplicationTypeId: true,
        Version: true
      }
    })).reduce((acc, v) => {

      if (!acc[v.BuildEngineUrl]) {
        acc[v.BuildEngineUrl] = {};
      }

      acc[v.BuildEngineUrl][v.ApplicationTypeId] = v.Version;
      return acc;
    }, {});

  const prisma = DatabaseReads.$extends({
    result: {
      products: {
        LatestVersion: {
          compute(product) {
            return product.ProductBuilds[0].AppBuilderVersion;
          },
        },
        RequiredVersion: {
          compute(product) {
            const p = product.Project;
            return systemVersions[p.Organization.BuildEngineUrl][p.ApplicationType.Id];
          }
        }
      }
    },
  });

  const projects = (await prisma.organizations.findMany({
    where: {
      ...filterAdminOrgs(locals.security, params.orgId ? Number(params.orgId) : undefined),
    },
    select: {
      Id: true,
      Name: true,
      Projects: {
        orderBy: { Name: 'asc' },
        where: {
          DateArchived: null, // Project has not been archived
          RebuildOnSoftwareUpdate: true, // Project setting is true
          Products: {
            some: {
              WorkflowInstance: null,
              DatePublished: { not: null },
            }
          }
        },
        select: {
          Name: true,
          ApplicationType: {
            select: {
              Id: true,
            }
          },
          Products: {
            where: {
              WorkflowInstance: null,
              DatePublished: { not: null },
            },
            select: {
              Id: true,
              LatestVersion: true,
              RequiredVersion: true,

              Project: {
                select: {
                  ApplicationType: {
                    select: {
                      Id: true,
                    }
                  },
                  Organization: {
                    select: {
                      BuildEngineUrl: true,
                    }
                  },
                }
              },

              ProductBuilds: {
                orderBy: { DateCreated: 'desc' },
                take: 1,

                select: {
                  AppBuilderVersion: true
                }
              }
            }
          }
        }
      }
    }
  })).map((org) => {
    // Filter projects that still have at least one product after version check
    const filteredProjects = org.Projects
      .map((project) => {
        // Filter products where LatestVersion !== RequiredVersion
        const filteredProducts = project.Products
          .filter(({ LatestVersion, RequiredVersion }) =>
            LatestVersion !== RequiredVersion)
          .map(({ Id, LatestVersion, RequiredVersion }) => ({
            Id,
            LatestVersion,
            RequiredVersion,
          }));

        return {
          ...project,
          Products: filteredProducts,
        };
      })
      // Remove projects with no remaining products
      .filter((project) => project.Products.length > 0);

    return {
      ...org,
      Projects: filteredProjects,
    };
  }).reduce((acc, org) => {
    acc[org.Id.toString()] = org;
    return acc
  }, {});

  // Get current rebuilds for the affected organizations to show in the UI
  const rebuildsData = await getRebuildsForOrgIds(organizationIds);

  // Fetch all available ApplicationTypes for the form toggles
  const applicationTypes = await DatabaseReads.applicationTypes.findMany({
    select: {
      Id: true,
      Name: true,
      Description: true
    }
  });

  const form = await superValidate(valibot(formSchema));

  return {
    form,
    rebuilds: rebuildsData.rebuilds,
    applicationTypes,
    projects,
  };
}) satisfies PageServerLoad;

/// ACTIONS
export const actions = {
  //
  /// START: Starts rebuilds for affected organizations.
  //
  async start({ request, locals, params }) {
    // Determine what organizations are being affected and check security
    if (params.orgId) {
      locals.security.requireAdminOfOrg(Number(params.orgId));
    } else {
      locals.security.requireAdminOfAny();
    }

    const form = await superValidate(request, valibot(formSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    const organizations = await DatabaseReads.organizations.findMany({
      where: filterAdminOrgs(locals.security, params.orgId ? Number(params.orgId) : undefined),
      select: {
        Id: true
      }
    });

    const productsToRebuild = await getProductsForRebuild(
      organizations.map((o) => o.Id),
      form.data.applicationTypeIds
    );

    // Attempt rebuilds for each affected product
    const rebuildResults = await Promise.allSettled(
      productsToRebuild.map((p) => {
        return doProductAction(p.id, ProductActionType.Rebuild, form.data.comment);
      })
    );

    // Separate successful and failed products
    const successfulProducts: typeof productsToRebuild = [];
    const failedProducts: Array<{ id: string; projectName: string; error: string }> = [];

    rebuildResults.forEach((result, index) => {
      const product = productsToRebuild[index];
      if (result.status === 'fulfilled') {
        successfulProducts.push(product);
      } else {
        failedProducts.push({
          id: product.id,
          projectName: product.projectName,
          error: result.reason instanceof Error ? result.reason.message : String(result.reason)
        });
      }
    });

    // Record only successful rebuilds in SoftwareUpdates table
    if (successfulProducts.length > 0) {
      await DatabaseWrites.softwareUpdates.recordRebuilds({
        initiatorId: locals.security.userId,
        comment: form.data.comment,
        items: successfulProducts.map((p) => ({
          buildEngineUrl: p.buildEngineUrl,
          applicationTypeId: p.applicationTypeId,
          version: p.requiredVersion!,
          productId: p.id,
          organizationId: p.organizationId
        }))
      });
    }

    return {
      form,
      ok: failedProducts.length === 0,
      ...(failedProducts.length > 0 && {
        failures: {
          count: failedProducts.length,
          products: failedProducts,
          successCount: successfulProducts.length
        }
      })
    };
  }
} satisfies Actions;
