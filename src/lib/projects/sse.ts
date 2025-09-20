import { SpanStatusCode, trace } from '@opentelemetry/api';
import { RoleId } from '$lib/prisma';
import { getProductActions } from '$lib/products';
import { canModifyProject } from '$lib/projects';
import { userGroupsForOrg } from '$lib/projects/server';
import { DatabaseReads } from '$lib/server/database';

const tracer = trace.getTracer('ProjectSSE');
export type ProjectDataSSE = Awaited<ReturnType<typeof getProjectDetails>>;
export async function getProjectDetails(id: number, security: Security) {
  // permissions checked in auth
  return tracer.startActiveSpan('getProjectDetails', async (span) => {
    span.setAttributes({
      'project.id': id,
      'project.userId': security.userId
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
          WorkflowProjectUrl: true,
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
              Id: true
            }
          },
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
                  Id: true,
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
              Users: {
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
          Id: project.Organization.Id
        },
        select: {
          OrganizationStores: {
            select: {
              Store: {
                select: {
                  Id: true,
                  Name: true,
                  Description: true,
                  StoreTypeId: true
                }
              }
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
          }
        }
      });
      span.addEvent('Product transitions fetched');
      const strippedTransitions = project.Products.map((p) => [
        transitions.findLast((tr) => tr.ProductId === p.Id && tr.DateTransition !== null)!,
        transitions.find((tr) => tr.ProductId === p.Id && tr.DateTransition === null)!
      ]);

      const productDefinitions = (
        await DatabaseReads.organizationProductDefinitions.findMany({
          where: {
            OrganizationId: project.Organization.Id,
            ProductDefinition: {
              ApplicationTypes: project.ApplicationType
            }
          },
          select: {
            ProductDefinition: {
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
            }
          }
        })
      ).map((pd) => pd.ProductDefinition);

      const projectProductDefinitionIds = project.Products.map((p) => p.ProductDefinition.Id);
      span.addEvent('Product definitions fetched');

      const canEdit = canModifyProject(security, project.Owner.Id, project.Organization.Id);

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
            actions: canEdit ? getProductActions(product, project.Owner.Id, security.userId) : []
          }))
        },
        productsToAdd: productDefinitions.filter(
          (pd) => !projectProductDefinitionIds.includes(pd.Id)
        ),
        stores: organization?.OrganizationStores.map((os) => os.Store) ?? [],
        possibleProjectOwners: await DatabaseReads.users.findMany({
          where: {
            OrganizationMemberships: {
              some: {
                OrganizationId: project.Organization.Id
              }
            },
            GroupMemberships: {
              some: {
                GroupId: project.Group.Id
              }
            }
          }
        }),
        // possibleGroups are ones owned by the same org as the project and contain the project's owner
        possibleGroups: await DatabaseReads.groups.findMany({
          where: {
            OwnerId: project.Organization.Id,
            GroupMemberships: {
              some: {
                UserId: project.Owner.Id
              }
            }
          }
        }),
        // All users who are members of the group and have the author role in the project's organization
        // May be a more efficient way to search this, by referencing group memberships instead of users
        authorsToAdd: await DatabaseReads.users.findMany({
          where: {
            GroupMemberships: {
              some: {
                GroupId: project?.Group.Id
              }
            },
            UserRoles: {
              some: {
                OrganizationId: project?.Organization.Id,
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
        userGroups: (await userGroupsForOrg(security.userId, project.Organization.Id)).map(
          (g) => g.GroupId
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
