import type { Session } from '@auth/sveltekit';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { error } from '@sveltejs/kit';
import { stringify } from 'devalue';
import { produce } from 'sveltekit-sse';
import { type SSEPageEvents, SSEPageUpdates } from './listener';
import { RoleId } from '$lib/prisma';
import { userGroupsForOrg } from '$lib/projects/server';
import { getURLandToken } from '$lib/server/build-engine-api/requests';
import { DatabaseReads } from '$lib/server/database';
import { isSuperAdmin } from '$lib/utils/roles';

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
      const isSuper = isSuperAdmin(userSession.roles);
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
          Products: {
            select: {
              Id: true,
              DateUpdated: true,
              DatePublished: true,
              PublishLink: true,
              Properties: true,
              ProductDefinition: {
                select: {
                  Id: true
                }
              },
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
              ProductBuilds: isSuper
                ? {
                    select: {
                      BuildEngineBuildId: true,
                      TransitionId: true
                    },
                    orderBy: {
                      DateCreated: 'desc'
                    }
                  }
                : false,
              ProductPublications: isSuper
                ? {
                    select: {
                      BuildEngineReleaseId: true,
                      TransitionId: true
                    },
                    orderBy: {
                      DateCreated: 'desc'
                    }
                  }
                : false,
              WorkflowInstance: {
                select: {
                  State: true,
                  WorkflowDefinition: {
                    select: {
                      Type: true
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
          },
          Group: {
            select: {
              Id: true,
              Name: true
            }
          }
        }
      });
      span.addEvent('Project fetched');
      const organization = await DatabaseReads.organizations.findUniqueOrThrow({
        where: {
          Id: project.OrganizationId
        },
        select: {
          System: isSuper,
          UseDefaultBuildEngine: isSuper
        }
      });
      span.addEvent('Organization fetched');

      const transitions = await DatabaseReads.productTransitions.findMany({
        where: {
          ProductId: {
            in: project.Products.map((p) => p.Id)
          }
          // DateTransition: null
        },
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
      });
      span.addEvent('Product transitions fetched');
      const strippedTransitions = project.Products.map((p) => [
        transitions.findLast((tr) => tr.ProductId === p.Id && tr.DateTransition !== null)!,
        transitions.find((tr) => tr.ProductId === p.Id && tr.DateTransition === null)!
      ]);

      return {
        project: {
          ...project,
          OwnerId: project.Owner.Id,
          GroupId: project.Group.Id,
          Products: project.Products.map((product) => ({
            ...product,
            Transitions: transitions.filter((t) => t.ProductId === product.Id),
            PreviousTransition: strippedTransitions.find(
              (t) => (t[0] ?? t[1])?.ProductId === product.Id
            )?.[0],
            ActiveTransition: strippedTransitions.find(
              (t) => (t[0] ?? t[1])?.ProductId === product.Id
            )?.[1],
            BuildEngineUrl: isSuper ? `${getURLandToken(organization).url}` : undefined
          }))
        }
      };
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (e as Error).message
      });
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
      return await DatabaseReads.organizations.findUniqueOrThrow({
        where: {
          Id: project.OrganizationId
        },
        select: {
          Stores: {
            select: {
              Id: true,
              BuildEnginePublisherId: true,
              GooglePlayTitle: true,
              Description: true,
              StoreTypeId: true
            }
          },
          ProductDefinitions: {
            where: {
              Organizations: { some: { Id: project.OrganizationId } },
              OR: [
                { AllowAllApplicationTypes: true },
                { ApplicationTypes: { some: { Id: project.TypeId } } }
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
              RepublishWorkflowId: true
            }
          }
        }
      });
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (e as Error).message
      });
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
    tasks: projects.flatMap((pj) =>
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
    ),
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
        // console.log(`Project page SSE update for project ${id}`);
        const data = await query(id, userSession);
        const { error } = emit(event, stringify(data));
        if (error) {
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
