import { RoleId } from '$lib/prismaTypes';
import prisma, { idSchema } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

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

// Are we sending too much data?
export const load = (async ({ params }) => {
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
    authorsToAdd,
    authorForm,
    reviewerForm,
    deleteAuthorForm: await superValidate(valibot(deleteAuthorSchema)),
    deleteReviewerForm: await superValidate(valibot(deleteReviewerSchema))
  };
}) satisfies PageServerLoad;

export const actions = {
  async deleteProduct(event) {
    const form = await superValidate(event.request, valibot(v.object({ id: v.string() })));
    if (!form.valid) return fail(400, { form, ok: false });
    await prisma.userTasks.deleteMany({
      where: {
        ProductId: form.data.id
      }
    });
    await prisma.products.delete({
      where: {
        Id: form.data.id
      }
    });
  },
  async deleteAuthor(event) {
    const form = await superValidate(event.request, valibot(deleteAuthorSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await prisma.authors.delete({
      where: {
        Id: form.data.id
      }
    });
    return { form, ok: true };
  },
  async deleteReviewer(event) {
    const form = await superValidate(event.request, valibot(deleteReviewerSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await prisma.reviewers.delete({
      where: {
        Id: form.data.id
      }
    });
    return { form, ok: true };
  },
  async addProduct(event) {
    // TODO: api and bulltask
  },
  async addAuthor(event) {
    const form = await superValidate(event.request, valibot(addAuthorSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    // Appears that CanUpdate is not used TODO
    await prisma.authors.create({
      data: {
        ProjectId: parseInt(event.params.id),
        UserId: form.data.author
      }
    });
    return { form, ok: true };
  },
  async addReviewer(event) {
    const form = await superValidate(event.request, valibot(addReviewerSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await prisma.reviewers.create({
      data: {
        Email: form.data.email,
        Name: form.data.name,
        Locale: form.data.language,
        ProjectId: parseInt(event.params.id)
      }
    });
    return { form, ok: true };
  }
} satisfies Actions;
