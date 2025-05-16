import { error } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
  // need this for org membership check
  const user = (await locals.auth())!.user;
  if (isNaN(parseInt(params.id))) return error(400);
  const project = await prisma.projects.findUnique({
    where: {
      Id: parseInt(params.id)
    },
    select: {
      Id: true,
      Name: true,
      Description: true,
      IsPublic: true,
      AllowDownloads: true,
      DateCreated: true,
      DateArchived: true,
      Language: true,
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

  return {
    project,
    isMemberOfProjectOrg: !!(await prisma.organizationMemberships.findFirst({
      where: { OrganizationId: project.Organization.Id, UserId: user.userId }
    }))
  };
}) satisfies PageServerLoad;
