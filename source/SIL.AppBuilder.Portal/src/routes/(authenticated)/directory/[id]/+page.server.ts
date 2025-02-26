import { error } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  // auth handled by hooks
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
          DateUpdated: true,
          DatePublished: true,
          ProductDefinition: {
            select: {
              Name: true
            }
          },
          ProductBuilds: {
            orderBy: [
              {
                DateUpdated: 'desc'
              }
            ],
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
              },
              ProductPublications: {
                select: {
                  Channel: true,
                  Success: true,
                  DateUpdated: true,
                  LogUrl: true
                },
                orderBy: {
                  DateUpdated: 'desc'
                },
                take: 1
              }
            },
            take: 1
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

  return { project };
}) satisfies PageServerLoad;
