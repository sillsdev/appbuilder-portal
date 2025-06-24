import { getProductActions } from '$lib/products';
import { ProjectPageUpdate } from '$lib/projects/listener.js';
import { userGroupsForOrg } from '$lib/projects/server';
import { prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { produce } from 'sveltekit-sse';

export async function POST(request) {
  const userId = (await request.locals.auth())!.user.userId;
  const { id: strId } = request.params;
  return produce(async function ({ emit, lock }) {
    const id = parseInt(strId);
    // User will be allowed to see project updates until they reload
    // even if their permission is revoked during the SSE connection.
    const { error } = emit('projectData', JSON.stringify(await getProjectDetails(id, userId)));
    if (error) {
      return;
    }
    ProjectPageUpdate.on('update', async function updateCb(updateId) {
      // This is a little wasteful because it will emit much of the same data
      // if multiple users are connected to the same project page.
      if (updateId === id) {
        const projectData = await getProjectDetails(id, userId);
        const { error } = emit('projectData', JSON.stringify(projectData));
        if (error) {
          ProjectPageUpdate.off('update', updateCb);
        }
      }
    });
  });
}
export type ProjectDataSSE = Awaited<ReturnType<typeof getProjectDetails>>;
async function getProjectDetails(id: number, userId: number) {
  // permissions checked in auth
  const project = await prisma.projects.findUniqueOrThrow({
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

  const organization = await prisma.organizations.findUnique({
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

  const transitions = await prisma.productTransitions.findMany({
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
  const strippedTransitions = project.Products.map((p) => [
    transitions.findLast((tr) => tr.ProductId === p.Id && tr.DateTransition !== null)!,
    transitions.find((tr) => tr.ProductId === p.Id && tr.DateTransition === null)!
  ]);

  const productDefinitions = (
    await prisma.organizationProductDefinitions.findMany({
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
        actions: getProductActions(product, project.Owner.Id, userId)
      }))
    },
    productsToAdd: productDefinitions.filter((pd) => !projectProductDefinitionIds.includes(pd.Id)),
    stores: organization?.OrganizationStores.map((os) => os.Store) ?? [],
    possibleProjectOwners: await prisma.users.findMany({
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
    possibleGroups: await prisma.groups.findMany({
      where: {
        OwnerId: project.Organization.Id
      }
    }),
    // All users who are members of the group and have the author role in the project's organization
    // May be a more efficient way to search this, by referencing group memberships instead of users
    authorsToAdd: await prisma.users.findMany({
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
    userGroups: (await userGroupsForOrg(userId, project.Organization.Id)).map((g) => g.GroupId)
  };
}
