import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async ({ params, locals }) => {
  // need this for org membership check
  locals.security.requireAuthenticated();
  // Anyone can view a public project, even if not an org member
  // But we need to check for org membership if downloads are allowed
  if (isNaN(parseInt(params.id))) return error(404);
  const projectCheck = await DatabaseReads.projects.findUnique({
    where: {
      Id: parseInt(params.id)
    },
    select: {
      AllowDownloads: true,
      IsPublic: true,
      OrganizationId: true
    }
  });
  if (!projectCheck) return error(404);
  // Is this the right error? Should 404 be returned instead?
  if (!projectCheck.IsPublic) return error(403);

  // This assumes that a null value is meant as false
  const allowDownloads = !!(
    projectCheck.AllowDownloads ||
    (await DatabaseReads.organizationMemberships.findFirst({
      where: { OrganizationId: projectCheck.OrganizationId, UserId: locals.security.userId }
    }))
  );

  return {
    project: await DatabaseReads.projects.findUniqueOrThrow({
      where: {
        Id: parseInt(params.id)
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
                    BuildId: true,
                    Success: true,
                    ProductArtifacts: {
                      select: {
                        ArtifactType: true,
                        FileSize: true,
                        Url: allowDownloads,
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
    }),
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
