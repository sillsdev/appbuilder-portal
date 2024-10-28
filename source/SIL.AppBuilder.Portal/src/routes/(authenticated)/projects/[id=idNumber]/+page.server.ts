import { idSchema } from '$lib/valibot';
import { error } from '@sveltejs/kit';
import { BullMQ, DatabaseWrites, prisma, queues } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { verifyCanViewAndEdit  } from '$lib/projects/common.server';

const deleteReviewerSchema = v.object({
  id: idSchema
});
const deleteAuthorSchema = v.object({
  id: idSchema
});
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
  storeId: idSchema,
  storeLanguageId: v.nullable(idSchema)
});

// Are we sending too much data?
// Maybe? I pared it down a bit with `select` instead of `include` - Aidan
export const load = (async ({ locals, params }) => {
  if (!verifyCanViewAndEdit((await locals.auth())!, parseInt(params.id))) return error(403);
  const project = await prisma.projects.findUnique({
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
          ProductDefinition: {
            select: {
              Id: true,
              Name: true
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
          Abbreviation: true
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
  if (!project) return error(400);

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
  })

  const transitions = await prisma.productTransitions.findMany({
    where: {
      ProductId: {
        in: project.Products.map((p) => p.Id)
      }
      // DateTransition: null
    },
    orderBy: [
      {
        Id: 'asc'
      }
    ]
  });
  const strippedTransitions = project.Products.map((p) => [
    transitions.findLast((tr) => tr.ProductId === p.Id && tr.DateTransition !== null)!,
    transitions.find((tr) => tr.ProductId === p.Id && tr.DateTransition === null)!
  ]);
  // All users who are members of the group and have the author role in the project's organization
  // May be a more efficient way to search this, by referencing group memberships instead of users
  const authorsToAdd = await prisma.users.findMany({
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
      }
    }
  });

  const productDefinitions = (await prisma.organizationProductDefinitions.findMany({
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
  })).map((pd) => pd.ProductDefinition);

  const projectProductDefinitionIds = project.Products.map((p) => p.ProductDefinition.Id);

  const authorForm = await superValidate(valibot(addAuthorSchema));
  const reviewerForm = await superValidate({ language: 'en-us' }, valibot(addReviewerSchema));
  return {
    project: {
      ...project,
      Products: project.Products.map((product) => ({
        ...product,
        Transitions: transitions.filter((t) => t.ProductId === product.Id),
        PreviousTransition: strippedTransitions.find(
          (t) => (t[0] ?? t[1])?.ProductId === product.Id
        )?.[0],
        ActiveTransition: strippedTransitions.find(
          (t) => (t[0] ?? t[1])?.ProductId === product.Id
        )?.[1]
      }))
    },
    possibleProjectOwners: await prisma.users.findMany({
      where: {
        OrganizationMemberships: {
          some: {
            OrganizationId: project.Organization.Id
          }
        }
      }
    }),
    possibleGroups: await prisma.groups.findMany({
      where: {
        OwnerId: project.Organization.Id
      }
    }),
    authorsToAdd,
    authorForm,
    reviewerForm,
    deleteAuthorForm: await superValidate(valibot(deleteAuthorSchema)),
    deleteReviewerForm: await superValidate(valibot(deleteReviewerSchema)),
    productsToAdd: productDefinitions.filter((pd) => !projectProductDefinitionIds.includes(pd.Id)),
    addProductForm: await superValidate(valibot(addProductSchema)),
    stores: organization?.OrganizationStores.map((os) => os.Store) ?? []
  };
}) satisfies PageServerLoad;

export const actions = {
  async deleteProduct(event) {
    if (!verifyCanViewAndEdit((await event.locals.auth())!, parseInt(event.params.id)))
      return fail(403);
    const form = await superValidate(event.request, valibot(v.object({ id: v.string() })));
    if (!form.valid) return fail(400, { form, ok: false });
    // delete all tasks for this product id, then delete the product
    await DatabaseWrites.products.delete(form.data.id);
  },
  async deleteAuthor(event) {
    if (!verifyCanViewAndEdit((await event.locals.auth())!, parseInt(event.params.id)))
      return fail(403);
    const form = await superValidate(event.request, valibot(deleteAuthorSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    // TODO: Will this result in the desired behavior if a user has multiple roles?
    // What if, for some unfathomable reason, a user is both a project owner
    // and an Author on the same project? As of right now, all tasks for that user 
    // in that project will be deleted, regardless of role. Should a user be prevented from having more than one role for a project?
    await queues.scriptoria.add(`Remove UserTasks for Author #${form.data.id}`, {
      type: BullMQ.ScriptoriaJobType.UserTasks_Modify,
      scope: 'Project',
      projectId: parseInt(event.params.id),
      operation: {
        type: BullMQ.UserTasks.OpType.Delete,
        by: 'UserId',
        users: [form.data.id]
      }
    });
    await DatabaseWrites.authors.delete({ where: { Id: form.data.id } });
    return { form, ok: true };
  },
  async deleteReviewer(event) {
    if (!verifyCanViewAndEdit((await event.locals.auth())!, parseInt(event.params.id)))
      return fail(403);
    const form = await superValidate(event.request, valibot(deleteReviewerSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.reviewers.delete({
      where: {
        Id: form.data.id
      }
    });
    return { form, ok: true };
  },
  async addProduct(event) {
    if (!verifyCanViewAndEdit((await event.locals.auth())!, parseInt(event.params.id)))
      return fail(403);
    const form = await superValidate(event.request, valibot(addProductSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    // Appears that CanUpdate is not used TODO
    const productId = await DatabaseWrites.products.create({
      ProjectId: parseInt(event.params.id),
      ProductDefinitionId: form.data.productDefinitionId,
      StoreId: form.data.storeId,
      StoreLanguageId: form.data.storeLanguageId ?? undefined,
      WorkflowJobId: 0,
      WorkflowBuildId: 0,
      WorkflowPublishId: 0
    });

    return { form, ok: !!productId };
  },
  async addAuthor(event) {
    if (!verifyCanViewAndEdit((await event.locals.auth())!, parseInt(event.params.id)))
      return fail(403);
    const form = await superValidate(event.request, valibot(addAuthorSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    // Appears that CanUpdate is not used TODO
    await DatabaseWrites.authors.create({
      data: {
        ProjectId: parseInt(event.params.id),
        UserId: form.data.author
      }
    });
    return { form, ok: true };
  },
  async addReviewer(event) {
    if (!verifyCanViewAndEdit((await event.locals.auth())!, parseInt(event.params.id)))
      return fail(403);
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
  async editSettings(event) {
    if (!verifyCanViewAndEdit((await event.locals.auth())!, parseInt(event.params.id)))
      return fail(403);
    const form = await superValidate(
      event.request,
      valibot(
        v.object({
          isPublic: v.boolean(),
          allowDownload: v.boolean()
        })
      )
    );
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.projects.update(parseInt(event.params.id), {
      IsPublic: form.data.isPublic,
      AllowDownloads: form.data.allowDownload
    });
    return { form, ok: true };
  },
  async editOwnerGroup(event) {
    if (!verifyCanViewAndEdit((await event.locals.auth())!, parseInt(event.params.id)))
      return fail(403);
    const form = await superValidate(event.request, valibot(updateOwnerGroupSchema));
    console.log(form);
    if (!form.valid) return fail(400, { form, ok: false });
    const success = await DatabaseWrites.projects.update(parseInt(event.params.id), {
      GroupId: form.data.group,
      OwnerId: form.data.owner
    });
    console.log(success);
    return { form, ok: success };
  }
} satisfies Actions;
