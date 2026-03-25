import type { Session } from '@auth/sveltekit';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { error } from '@sveltejs/kit';
import { stringify } from 'devalue';
import { produce } from 'sveltekit-sse';
import { type SSEPageEvents, SSEPageUpdates } from './listener';
import { ProductTransitionType, ProjectActionString, ProjectActionType, RoleId } from '$lib/prisma';
import { minifyProductCard, minifyProductDetails } from '$lib/products';
import { userGroupsForOrg } from '$lib/projects/server';
import { getURLandToken } from '$lib/server/build-engine-api/requests';
import { DatabaseReads } from '$lib/server/database';
import { isSuperAdmin } from '$lib/utils/roles';
import { byDate } from '$lib/utils/sorting';

const tracer = trace.getTracer('ProjectSSE');
export type ProjectDataSSE = Awaited<ReturnType<typeof getProjectDetails>>;
export async function getProjectDetails(id: number, userSession: Session['user']) {
  // permissions checked in auth
  return tracer.startActiveSpan('getProjectDetails', async (span) => {
    span.setAttributes({
      'project.id': id,
      'project.userId': userSession.userId
    });
    try {
      const project = await DatabaseReads.projects.findUniqueOrThrow({
        where: {
          Id: id
        },
        select: {
          Id: true,
          Name: true,
          Description: true,
          RepositoryUrl: true,
          IsPublic: true,
          AllowDownloads: true,
          AutoPublishOnRebuild: true,
          RebuildOnSoftwareUpdate: true,

          DateCreated: true,
          DateArchived: true,
          Language: true,
          ApplicationType: {
            select: {
              Id: true,
              Description: true
            }
          },
          OrganizationId: true,
          OwnerId: true,
          Owner: {
            select: {
              Id: true,
              Name: true
            }
          },
          GroupId: true,
          Group: {
            select: {
              Id: true,
              Name: true
            }
          },
          ProjectActions: {
            select: {
              User: {
                select: {
                  Id: true,
                  Name: true
                }
              },
              DateAction: true,
              ActionType: true,
              Action: true,
              Value: true,
              ExternalId: true
            },
            orderBy: {
              DateAction: 'asc'
            }
          }
        }
      });
      span.addEvent('Project fetched');

      return {
        project,
        actionParams: {
          users: await DatabaseReads.users.findMany({
            where: {
              Id: {
                in: project.ProjectActions.filter(
                  (pa) =>
                    pa.ExternalId &&
                    (pa.ActionType === ProjectActionType.Author ||
                      (pa.ActionType === ProjectActionType.OwnerGroup &&
                        pa.Action !== ProjectActionString.AssignGroup))
                ).map((pa) => pa.ExternalId!)
              }
            },
            select: {
              Id: true,
              Name: true
            }
          }),
          groups: await DatabaseReads.groups.findMany({
            where: {
              Id: {
                in: project.ProjectActions.filter(
                  (pa) =>
                    pa.ExternalId &&
                    pa.ActionType === ProjectActionType.OwnerGroup &&
                    pa.Action === ProjectActionString.AssignGroup
                ).map((pa) => pa.ExternalId!)
              }
            },
            select: {
              Id: true,
              Name: true
            }
          }),
          prodDefs: await DatabaseReads.productDefinitions.findMany({
            where: {
              Id: {
                in: project.ProjectActions.filter(
                  (pa) => pa.ExternalId && pa.ActionType === ProjectActionType.Product
                ).map((pa) => pa.ExternalId!)
              }
            },
            select: {
              Id: true,
              Name: true,
              Workflow: {
                select: {
                  ProductType: true
                }
              }
            }
          })
        }
      };
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (e as Error).message
      });
      // not found
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw error(404);
      }
      throw error(500);
    } finally {
      span.end();
    }
  });
}

export type ProjectGroupsSSE = Awaited<ReturnType<typeof getProjectGroupData>>;
export async function getProjectGroupData(id: number, userSession: Session['user']) {
  // permissions checked in auth
  return tracer.startActiveSpan('getProjectGroups', async (span) => {
    span.setAttributes({
      'project.id': id,
      'project.userId': userSession.userId
    });
    try {
      const project = await DatabaseReads.projects.findUniqueOrThrow({
        where: {
          Id: id
        },
        select: {
          OrganizationId: true,
          OwnerId: true,
          GroupId: true,
          Authors: {
            select: {
              User: {
                select: {
                  Id: true,
                  Name: true
                }
              }
            }
          },
          Reviewers: {
            select: {
              Id: true,
              Name: true,
              Email: true
            }
          }
        }
      });

      return {
        authors: project.Authors,
        reviewers: project.Reviewers,
        possibleOwners: await DatabaseReads.users.findMany({
          where: {
            Organizations: {
              some: {
                Id: project.OrganizationId
              }
            },
            Groups: {
              some: {
                Id: project.GroupId
              }
            },
            UserRoles: {
              some: {
                OrganizationId: project.OrganizationId,
                RoleId: { in: [RoleId.AppBuilder, RoleId.OrgAdmin] }
              }
            }
          },
          select: {
            Id: true,
            Name: true
          }
        }),
        // possibleGroups are ones owned by the same org as the project and contain the project's owner
        possibleGroups: await DatabaseReads.groups.findMany({
          where: {
            OwnerId: project.OrganizationId,
            Users: {
              some: {
                Id: project.OwnerId
              }
            }
          }
        }),
        // All users who are members of the group and have the author role in the project's organization
        possibleAuthors: await DatabaseReads.users.findMany({
          where: {
            Groups: {
              some: {
                Id: project.GroupId
              }
            },
            UserRoles: {
              some: {
                OrganizationId: project?.OrganizationId,
                RoleId: RoleId.Author
              }
            },
            Authors: {
              none: {
                ProjectId: id
              }
            }
          },
          select: {
            Id: true,
            Name: true
          }
        }),
        userGroups: (await userGroupsForOrg(userSession.userId, project.OrganizationId)).map(
          (g) => g.Id
        )
      };
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (e as Error).message
      });
      // not found
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw error(404);
      }
      throw error(500);
    } finally {
      span.end();
    }
  });
}

export type ProjectOrgsSSE = Awaited<ReturnType<typeof getProjectOrgData>>;
export async function getProjectOrgData(id: number, userSession: Session['user']) {
  // permissions checked in auth
  return tracer.startActiveSpan('getProjectOrg', async (span) => {
    span.setAttributes({
      'project.id': id,
      'project.userId': userSession.userId
    });
    try {
      const project = await DatabaseReads.projects.findUniqueOrThrow({
        where: {
          Id: id
        },
        select: {
          OrganizationId: true,
          TypeId: true
        }
      });
      span.addEvent('Project fetched');
      return {
        Stores: await DatabaseReads.stores.findMany({
          where: {
            OR: [
              { Organizations: { some: { Id: project.OrganizationId } } },
              { Products: { some: { ProjectId: id } } }
            ]
          },
          select: {
            Id: true,
            BuildEnginePublisherId: true,
            GooglePlayTitle: true,
            Description: true,
            StoreTypeId: true,
            _count: {
              select: {
                Organizations: { where: { Id: project.OrganizationId } }
              }
            }
          }
        }),
        ProductDefinitions: await DatabaseReads.productDefinitions.findMany({
          where: {
            OR: [
              {
                Organizations: { some: { Id: project.OrganizationId } },
                OR: [
                  { AllowAllApplicationTypes: true },
                  { ApplicationTypes: { some: { Id: project.TypeId } } }
                ]
              },
              {
                Products: { some: { ProjectId: id } }
              }
            ]
          },
          select: {
            Id: true,
            Name: true,
            Description: true,
            Workflow: {
              select: {
                ProductType: true,
                StoreTypeId: true
              }
            },
            RebuildWorkflowId: true,
            RepublishWorkflowId: true,
            _count: {
              select: {
                Organizations: { where: { Id: project.OrganizationId } }
              }
            }
          }
        })
      };
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (e as Error).message
      });
      // not found
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw error(404);
      }
      throw error(500);
    } finally {
      span.end();
    }
  });
}

export type ProjectProductsSSE = Awaited<ReturnType<typeof getProjectProducts>>;
export async function getProjectProducts(id: number, userSession: Session['user']) {
  // permissions checked in auth
  return tracer.startActiveSpan('getProductTransitions', async (span) => {
    span.setAttributes({
      'project.id': id,
      'project.userId': userSession.userId
    });
    try {
      const isSuper = isSuperAdmin(userSession.roles);

      const BuildEngineUrl = isSuper
        ? getURLandToken(
            await DatabaseReads.organizations.findFirstOrThrow({
              where: {
                Projects: {
                  some: { Id: id }
                }
              },
              select: {
                System: {
                  select: {
                    BuildEngineApiAccessToken: true,
                    BuildEngineUrl: true
                  }
                },
                UseDefaultBuildEngine: true
              }
            })
          ).url
        : undefined;

      const products = await DatabaseReads.products.findMany({
        where: {
          ProjectId: id
        },
        select: {
          Id: true,
          DateUpdated: true,
          DatePublished: true,
          PublishLink: true,
          Properties: true,
          ProductDefinitionId: true,
          // Probably don't need to optimize this. Unless it's a really large org,
          // there probably won't be very many of these records for an individual
          // product. In most cases, there will only be zero or one. The only times
          // there will be more is if it's an admin task or an author task.
          UserTasks: {
            select: {
              DateCreated: true,
              UserId: true
            }
          },
          StoreId: true,
          BuildEngineJobId: isSuper,
          CurrentBuildId: isSuper,
          CurrentReleaseId: isSuper,
          ProductBuilds: {
            select: {
              BuildEngineBuildId: true,
              TransitionId: true,
              Status: true
            },
            orderBy: {
              DateCreated: 'desc'
            },
            take: isSuper ? undefined : 1
          },
          ProductPublications: {
            select: {
              BuildEngineReleaseId: true,
              TransitionId: true,
              Status: true
            },
            orderBy: {
              DateCreated: 'desc'
            },
            take: isSuper ? undefined : 1
          },
          WorkflowInstance: {
            select: {
              State: true,
              WorkflowDefinition: {
                select: {
                  Type: true
                }
              }
            }
          },
          ProductTransitions: {
            orderBy: [
              {
                DateTransition: 'asc'
              },
              {
                Id: 'asc'
              }
            ],
            include: {
              User: {
                select: {
                  Id: true,
                  Name: true
                }
              },
              QueueRecords: isSuper
                ? {
                    select: {
                      Queue: true,
                      JobId: true,
                      JobType: true
                    }
                  }
                : false
            }
          }
        }
      });

      return {
        products: products.map((p) => ({
          ...minifyProductCard(
            p,
            p.ProductTransitions.find((tr) => tr.ProductId === p.Id && tr.DateTransition === null),
            p.ProductTransitions.findLast(
              (tr) =>
                tr.ProductId === p.Id &&
                tr.DateTransition !== null &&
                (tr.TransitionType === ProductTransitionType.Activity ||
                  tr.TransitionType === ProductTransitionType.StartWorkflow)
            )
          ),
          ...minifyProductDetails(p, BuildEngineUrl)
        }))
      };
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (e as Error).message
      });
      // not found
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw error(404);
      }
      throw error(500);
    } finally {
      span.end();
    }
  });
}

/**
 * S = Status
 * C = Comment
 * U = DateUpdated
 * P = ProductId
 * Pj = ProjectId
 * PD = ProductDefinitionId
 */
export type UserTaskDataSSE = Awaited<ReturnType<typeof getUserTasks>>;
export async function getUserTasks(userId: number) {
  const projects = await DatabaseReads.projects.findMany({
    where: {
      Products: {
        some: {
          UserTasks: {
            some: {
              UserId: userId
            }
          }
        }
      }
    },
    select: {
      Id: true,
      Name: true,
      Products: {
        where: {
          UserTasks: {
            some: {
              UserId: userId
            }
          }
        },
        select: {
          Id: true,
          ProductDefinitionId: true,
          UserTasks: {
            select: {
              Status: true,
              Comment: true,
              DateUpdated: true,
              ProductId: true
            },
            orderBy: {
              DateUpdated: 'desc'
            },
            take: 1
          }
        }
      }
    }
  });
  return {
    tasks: projects
      .flatMap((pj) =>
        pj.Products.flatMap((p) =>
          p.UserTasks.map((u) => ({
            S: u.Status,
            C: u.Comment,
            U: u.DateUpdated,
            P: u.ProductId,
            Pj: pj.Id,
            PD: p.ProductDefinitionId
          }))
        )
      )
      .sort((a, b) => byDate(a.U, b.U)),
    projects: new Map(projects.map((p) => [p.Id, p.Name])),
    products: new Map(
      (
        await DatabaseReads.productDefinitions.findMany({
          where: {
            Products: { some: { Id: { in: projects.flatMap((p) => p.Products.map((p) => p.Id)) } } }
          },
          select: {
            Id: true,
            Name: true,
            Workflow: {
              select: {
                ProductType: true
              }
            }
          }
        })
      ).map((pd) => [pd.Id, { N: pd.Name, T: pd.Workflow.ProductType }])
    )
  };
}

export function createProducer<T>(
  id: number,
  userSession: Session['user'],
  stream: keyof SSEPageEvents,
  event: string,
  query: (id: number, userSession: Session['user']) => Promise<T>
) {
  return produce(async function start({ emit, lock }) {
    // User will be allowed to see project updates until they reload
    // even if their permission is revoked during the SSE connection.
    const { error } = emit(event, stringify(await query(id, userSession)));
    if (error) {
      return;
    }
    async function updateCb(updateId: number[]) {
      // This is a little wasteful because it will calculate much of the same data
      // multiple times if multiple users are connected to the same project page.
      if (updateId.includes(id)) {
        try {
          const data = await query(id, userSession);
          const { error } = emit(event, stringify(data));
          if (error) {
            SSEPageUpdates.off(stream, updateCb);
            clearInterval(pingInterval);
          }
        } catch {
          SSEPageUpdates.off(stream, updateCb);
          clearInterval(pingInterval);
        }
      }
    }
    SSEPageUpdates.on(stream, updateCb);
    const pingInterval = setInterval(function onDisconnect() {
      const { error } = emit('ping', '');
      if (!error) return;
      SSEPageUpdates.off(stream, updateCb);
      clearInterval(pingInterval);
    }, 10000).unref();
  });
}
