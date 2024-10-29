import { idSchema } from '$lib/valibot';
import { error } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { RoleId, WorkflowType } from 'sil.appbuilder.portal.common/prisma';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { verifyCanViewAndEdit  } from './common';
import { Workflow } from 'sil.appbuilder.portal.common';
import { workflowInputFromDBProductType } from 'sil.appbuilder.portal.common/workflow';

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
  storeLanguageId: idSchema,
  workflowJobId: idSchema,
  workflowBuildId: idSchema,
  workflowPublishId: idSchema
});

// Are we sending too much data?
export const load = (async ({ locals, params }) => {
  if (!verifyCanViewAndEdit((await locals.auth())!, parseInt(params.id))) return error(403);
  const project = await prisma.projects.findUnique({
    where: {
      Id: parseInt(params.id)
    },
    include: {
      ApplicationType: true,
      Products: {
        include: {
          ProductDefinition: {
            include: {
              Workflow: true
            }
          },
          UserTasks: true,
          Store: true
        }
      },
      Owner: true,
      Group: true,
      Authors: {
        include: {
          Users: true
        }
      },
      Reviewers: true
    }
  });
  if (!project) return error(400);
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
          GroupId: project?.GroupId
        }
      },
      UserRoles: {
        some: {
          OrganizationId: project?.OrganizationId,
          RoleId: RoleId.Author
        }
      }
    }
  });
  const authorForm = await superValidate(valibot(addAuthorSchema));
  const reviewerForm = await superValidate({ language: 'en-us' }, valibot(addReviewerSchema));
  return {
    project: {
      ...project,
      Products: project.Products.map((product) => ({
        ...product,
        Transitions: transitions.filter((t) => t.ProductId === product.Id),
        PreviousTransition: strippedTransitions.find(
          (t) => (t[0] ?? t[1]).ProductId === product.Id
        )?.[0],
        ActiveTransition: strippedTransitions.find(
          (t) => (t[0] ?? t[1]).ProductId === product.Id
        )?.[1]
      }))
    },
    possibleProjectOwners: await prisma.users.findMany({
      where: {
        OrganizationMemberships: {
          some: {
            OrganizationId: project.OrganizationId
          }
        }
      }
    }),
    possibleGroups: await prisma.groups.findMany({
      where: {
        OwnerId: project.OrganizationId
      }
    }),
    authorsToAdd,
    authorForm,
    reviewerForm,
    deleteAuthorForm: await superValidate(valibot(deleteAuthorSchema)),
    deleteReviewerForm: await superValidate(valibot(deleteReviewerSchema))
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
    // TODO: api and bulltask
    const form = await superValidate(event.request, valibot(addProductSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    // Appears that CanUpdate is not used TODO
    const productId = await DatabaseWrites.products.create({
      ProjectId: parseInt(event.params.id),
      ProductDefinitionId: form.data.productDefinitionId,
      StoreId: form.data.storeId,
      StoreLanguageId: form.data.storeLanguageId,
      WorkflowJobId: form.data.workflowJobId,
      WorkflowBuildId: form.data.workflowBuildId,
      WorkflowPublishId: form.data.workflowPublishId
    });

    if (typeof productId === 'string') {
      const flow = (await prisma.productDefinitions.findUnique({
        where: {
          Id: form.data.productDefinitionId
        },
        select: {
          Workflow: {
            select: {
              // TODO: RequiredAdminLevel and ProductType should be directly in the database instead of calling a helper function
              Id: true,
              Type: true
            }
          }
        }
      }))?.Workflow;

      if (flow?.Type === WorkflowType.Startup) {
        Workflow.create(productId, workflowInputFromDBProductType(flow.Id));
      }
    }

    return { form, ok: true };
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
