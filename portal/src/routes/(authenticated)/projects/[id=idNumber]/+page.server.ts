import { baseLocale } from '$lib/paraglide/runtime';
import { getProductActions, ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { canModifyProject, projectActionSchema } from '$lib/projects';
import {
  doProjectAction,
  userGroupsForOrg
} from '$lib/projects/server';
import { deleteSchema, idSchema, propertiesSchema, stringIdSchema } from '$lib/valibot';
import { error } from '@sveltejs/kit';
import { BullMQ, DatabaseWrites, prisma, Queues } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const addAuthorSchema = v.object({
  author: idSchema
});
const addReviewerSchema = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  language: v.string()
});
const updateOwnerGroupSchema = v.object({
  owner: idSchema,
  group: idSchema
});
const addProductSchema = v.object({
  productDefinitionId: idSchema,
  storeId: idSchema
});
const updateProductPropertiesSchema = v.object({
  productId: stringIdSchema,
  properties: propertiesSchema
});

const productActionSchema = v.object({
  productId: stringIdSchema,
  productAction: v.enum(ProductActionType)
});

// Are we sending too much data?
// Maybe? I pared it down a bit with `select` instead of `include` - Aidan
export const load = (async ({ locals, params }) => {
  const session = (await locals.auth())!;
  // permissions checked in auth
  const project = await prisma.projects.findUniqueOrThrow({
    where: {
      Id: parseInt(params.id)
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
          // Probably don't need to optimize this. Unless it's a really large org, there probably won't be very many of these records for an individual product. In most cases, there will only be zero or one. The only times there will be more is if it's an admin task or an author task.
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
        actions: getProductActions(product, project.Owner.Id, session.user.userId)
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
    authorForm: await superValidate(valibot(addAuthorSchema)),
    reviewerForm: await superValidate({ language: baseLocale }, valibot(addReviewerSchema)),
    actionForm: await superValidate(valibot(projectActionSchema)),
    userGroups: (await userGroupsForOrg(session.user.userId, project.Organization.Id)).map(
      (g) => g.GroupId
    )
  };
}) satisfies PageServerLoad;

export const actions = {
  async deleteProduct(event) {
    // permissions checked in auth
    const form = await superValidate(event.request, valibot(productActionSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.products.delete(form.data.productId);
  },
  async deleteAuthor(event) {
    // permissions checked in auth
    const form = await superValidate(event.request, valibot(deleteSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const author = await DatabaseWrites.authors.delete({ where: { Id: form.data.id } });
    await Queues.UserTasks.add(`Remove UserTasks for Author #${form.data.id}`, {
      type: BullMQ.JobType.UserTasks_Modify,
      scope: 'Project',
      projectId: parseInt(event.params.id),
      operation: {
        type: BullMQ.UserTasks.OpType.Delete,
        users: [author.UserId],
        roles: [RoleId.Author]
      }
    });
    return { form, ok: true };
  },
  async deleteReviewer(event) {
    // permissions checked in auth
    const form = await superValidate(event.request, valibot(deleteSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.reviewers.delete({
      where: {
        Id: form.data.id
      }
    });
    return { form, ok: true };
  },
  async addProduct(event) {
    // permissions checked in auth
    const form = await superValidate(event.request, valibot(addProductSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const checkRepository = await prisma.projects.findUnique({
      where: {
        Id: parseInt(event.params.id)
      },
      select: {
        WorkflowProjectUrl: true
      }
    });
    if (!checkRepository?.WorkflowProjectUrl) {
      return error(400, 'Project Repository not Yet Initialized');
    }
    const productId = await DatabaseWrites.products.create({
      ProjectId: parseInt(event.params.id),
      ProductDefinitionId: form.data.productDefinitionId,
      StoreId: form.data.storeId,
      WorkflowJobId: 0,
      WorkflowBuildId: 0,
      WorkflowPublishId: 0
    });

    return { form, ok: !!productId };
  },
  async productAction(event) {
    // permissions checked in auth
    const form = await superValidate(event.request, valibot(productActionSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const product = await prisma.products.findUnique({
      where: {
        Id: form.data.productId
      },
      select: {
        ProjectId: true
      }
    });
    if (!product || product.ProjectId !== parseInt(event.params.id)) return fail(404);
    await doProductAction(form.data.productId, form.data.productAction);

    return { form, ok: true };
  },
  async updateProduct(event) {
    // permissions checked in auth
    const form = await superValidate(event.request, valibot(updateProductPropertiesSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const productId = await DatabaseWrites.products.update(form.data.productId, {
      Properties: form.data.properties
    });

    return { form, ok: !!productId };
  },
  async addAuthor(event) {
    // permissions checked in auth
    const form = await superValidate(event.request, valibot(addAuthorSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    // ISSUE: #1101 Appears that CanUpdate is not used
    const author = await DatabaseWrites.authors.create({
      data: {
        ProjectId: parseInt(event.params.id),
        UserId: form.data.author
      }
    });
    await Queues.UserTasks.add(`Add UserTasks for Author #${author.Id}`, {
      type: BullMQ.JobType.UserTasks_Modify,
      scope: 'Project',
      projectId: parseInt(event.params.id),
      operation: {
        type: BullMQ.UserTasks.OpType.Create,
        users: [form.data.author],
        roles: [RoleId.Author]
      }
    });
    return { form, ok: true };
  },
  async addReviewer(event) {
    // permissions checked in auth
    const form = await superValidate(event.request, valibot(addReviewerSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.reviewers.create({
      data: {
        Email: form.data.email,
        Name: form.data.name,
        Locale: form.data.language,
        ProjectId: parseInt(event.params.id)
      }
    });
    return { form, ok: true };
  },
  async toggleVisibility(event) {
    // permissions checked in auth
    const form = await superValidate(
      event.request,
      valibot(
        v.object({
          isPublic: v.boolean()
        })
      )
    );
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.projects.update(parseInt(event.params.id), {
      IsPublic: form.data.isPublic
    });
    return { form, ok: true };
  },
  async toggleDownload(event) {
    // permissions checked in auth
    const form = await superValidate(
      event.request,
      valibot(
        v.object({
          allowDownloads: v.boolean()
        })
      )
    );
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.projects.update(parseInt(event.params.id), {
      AllowDownloads: form.data.allowDownloads
    });
    return { form, ok: true };
  },
  async editOwnerGroup(event) {
    // permissions checked in auth
    const form = await superValidate(event.request, valibot(updateOwnerGroupSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const success = await DatabaseWrites.projects.update(parseInt(event.params.id), {
      GroupId: form.data.group,
      OwnerId: form.data.owner
    });
    return { form, ok: success };
  },
  async projectAction(event) {
    // permissions checked in auth

    const form = await superValidate(event.request, valibot(projectActionSchema));
    if (!form.valid || !form.data.operation || form.data.projectId === null)
      return fail(400, { form, ok: false });
    // prefer single project over array
    const project = await prisma.projects.findUniqueOrThrow({
      where: { Id: form.data.projectId! },
      select: {
        Id: true,
        Name: true,
        DateArchived: true,
        OwnerId: true,
        GroupId: true
      }
    });
    const session = (await event.locals.auth())!;
    if (!canModifyProject(session, project.OwnerId, form.data.orgId)) {
      return fail(403);
    }

    await doProjectAction(
      form.data.operation,
      project,
      session,
      form.data.orgId,
      form.data.operation === 'claim'
        ? (await userGroupsForOrg(session.user.userId, form.data.orgId)).map((g) => g.GroupId)
        : []
    );

    return { form, ok: true };
  }
} satisfies Actions;
