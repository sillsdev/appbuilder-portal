import type { Session } from '@auth/sveltekit';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { RoleId } from '$lib/prisma';
import { getProductActions } from '$lib/products';
import { canModifyProject } from '$lib/projects';
import { userGroupsForOrg } from '$lib/projects/server';
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
                  Id: true,
                  Name: true,
                  RebuildWorkflowId: true,
                  RepublishWorkflowId: true,
                  Workflow: {
                    select: {
                      ProductType: true
                    }
                  }
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
              Store: {
                select: {
                  Description: true
                }
              },
              WorkflowInstance: {
                select: {
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
          },
          Authors: {
            select: {
              Id: true,
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
      span.addEvent('Project fetched');
      const organization = await DatabaseReads.organizations.findUnique({
        where: {
          Id: project.OrganizationId
        },
        select: {
          Stores: {
            select: {
              Id: true,
              Name: true,
              Description: true,
              StoreTypeId: true
            }
          }
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
          QueueRecords: isSuperAdmin(userSession.roles)
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

      const productDefinitions = await DatabaseReads.productDefinitions.findMany({
        where: {
          Organizations: { some: { Id: project.OrganizationId } }
        },
        select: {
          Id: true,
          Name: true,
          Description: true,
          Workflow: {
            select: {
              StoreTypeId: true
            }
          }
        }
      });

      const projectProductDefinitionIds = project.Products.map((p) => p.ProductDefinition.Id);
      span.addEvent('Product definitions fetched');

      const canEdit = canModifyProject(userSession, project.Owner.Id, project.OrganizationId);

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
            actions: canEdit ? getProductActions(product, project.Owner.Id, userSession.userId) : []
          }))
        },
        productsToAdd: productDefinitions.filter(
          (pd) => !projectProductDefinitionIds.includes(pd.Id)
        ),
        stores: organization?.Stores ?? [],
        possibleProjectOwners: await DatabaseReads.users.findMany({
          where: {
            Organizations: {
              some: {
                Id: project.OrganizationId
              }
            },
            Groups: {
              some: {
                Id: project.Group.Id
              }
            }
          }
        }),
        // possibleGroups are ones owned by the same org as the project and contain the project's owner
        possibleGroups: await DatabaseReads.groups.findMany({
          where: {
            OwnerId: project.OrganizationId,
            Users: {
              some: {
                Id: project.Owner.Id
              }
            }
          }
        }),
        // All users who are members of the group and have the author role in the project's organization
        // May be a more efficient way to search this, by referencing group memberships instead of users
        authorsToAdd: await DatabaseReads.users.findMany({
          where: {
            Groups: {
              some: {
                Id: project?.Group.Id
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
                ProjectId: project.Id
              }
            }
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

export type UserTaskDataSSE = Awaited<ReturnType<typeof getUserTasks>>;
export async function getUserTasks(userId: number) {
  const tasks = await DatabaseReads.userTasks.findMany({
    where: {
      UserId: userId
    },
    select: {
      Status: true,
      Comment: true,
      DateUpdated: true,
      ProductId: true,
      Product: {
        select: {
          ProductDefinition: {
            select: {
              Name: true
            }
          },
          ProjectId: true,
          Project: {
            select: {
              Name: true
            }
          }
        }
      }
    },
    distinct: 'ProductId',
    orderBy: {
      // most recent first
      DateUpdated: 'desc'
    }
  });
  return tasks;
}
