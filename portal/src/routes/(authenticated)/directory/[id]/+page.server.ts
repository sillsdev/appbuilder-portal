import { error } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
  // need this for org membership check
  const user = (await locals.auth())!.user;
  if (isNaN(parseInt(params.id))) return error(400);
  const projectCheck = await prisma.projects.findUnique({
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
    (await prisma.organizationMemberships.findFirst({
      where: { OrganizationId: projectCheck.OrganizationId, UserId: user.userId }
    }))
  );

  return {
    project: await prisma.projects.findUniqueOrThrow({
      where: {
        Id: parseInt(params.id)
      },
      select: {
        Id: true,
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
            Owner: {
              select: {
                Name: true
              }
            }
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
                Channel: true,
                Success: true,
                DateUpdated: true,
                LogUrl: true,
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
    allowDownloads
  };
}) satisfies PageServerLoad;
