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
          ContactEmail: true,
          _count: {
            select: {
              Users: {
                where: {
                  Id: locals.security.userId
                }
              }
            }
          }
        }
      },
      Products: {
        select: {
          Id: true,
          ProductDefinition: {
            select: {
              Name: true,
              Workflow: {
                select: {
                  ProductType: true
                }
              }
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
  const allowDownloads = !!(project.AllowDownloads || project.Organization._count.Users);

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
      await DatabaseReads.users.findUniqueOrThrow({
        where: { Id: locals.security.userId },
        select: {
          Groups: { select: { Id: true } }
        }
      })
    ).Groups.map((gm) => gm.Id)
  };
}) satisfies PageServerLoad;
