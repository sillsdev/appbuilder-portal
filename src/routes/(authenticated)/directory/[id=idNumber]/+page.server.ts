import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async ({ params, locals }) => {
  locals.security.requireAuthenticated();
  // Anyone can view a public project, even if not an org member
  // But we need to check for org membership if downloads are allowed
  const projectId = Number(params.id);
  const project = await DatabaseReads.projects.findUnique({
    where: {
      Id: projectId
    },
    select: {
      Id: true,
      GroupId: true,
      Name: true,
      Description: true,
      DateCreated: true,
      DateArchived: true,
      Language: true,
      AllowDownloads: true,
      IsPublic: true,
      ApplicationType: {
        select: {
          Description: true
        }
      },
      Organization: {
        select: {
          Id: true,
          LogoUrl: true,
          Name: true,
          ContactEmail: true
        }
      },
      Products: {
        select: {
          Id: true,
          ProductDefinition: {
            select: {
              Name: true
            }
          },
          ProductPublications: {
            where: {
              Success: true
            },
            orderBy: {
              DateUpdated: 'desc'
            },
            take: 1,
            select: {
              ProductBuild: {
                select: {
                  Id: true,
                  Version: true,
                  BuildEngineBuildId: true,
                  Success: true,
                  AppBuilderVersion: true,
                  ProductArtifacts: {
                    select: {
                      ArtifactType: true,
                      FileSize: true,
                      Url: true,
                      DateUpdated: true
                    }
                  }
                }
              }
            }
          }
        }
      },
      Owner: {
        select: {
          Id: true,
          Name: true
        }
      }
    }
  });
  if (!project) return error(404);
  // Is this the right error? Should 404 be returned instead?
  if (!project.IsPublic) return error(403);

  // This assumes that a null value is meant as false
  const allowDownloads = !!(
    project.AllowDownloads ||
    (await DatabaseReads.organizationMemberships.findFirst({
      where: { OrganizationId: project.Organization.Id, UserId: locals.security.userId }
    }))
  );

  if (!allowDownloads) {
    project.Products.forEach((p) => {
      p.ProductPublications.forEach((pp) => {
        pp.ProductBuild.ProductArtifacts.forEach((pa) => {
          pa.Url = null;
        });
      });
    });
  }

  return {
    project,
    allowDownloads,
    sessionGroups: (
      await DatabaseReads.groupMemberships.findMany({
        where: { UserId: locals.security.userId },
        select: {
          GroupId: true
        }
      })
    ).map((gm) => gm.GroupId)
  };
}) satisfies PageServerLoad;
