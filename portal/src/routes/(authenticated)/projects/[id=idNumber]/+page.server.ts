import { baseLocale } from '$lib/paraglide/runtime';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { projectActionSchema } from '$lib/projects';
import { doProjectAction, userGroupsForOrg } from '$lib/projects/server';
import { deleteSchema, idSchema, propertiesSchema, stringIdSchema } from '$lib/valibot';
import { error } from '@sveltejs/kit';
import { BullMQ, DatabaseWrites, prisma, Queues } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, RequestEvent } from './$types';
import { addAuthorSchema, addReviewerSchema } from './forms/valibot';

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

export const load = async (event: RequestEvent) => {
  return {
    authorForm: await superValidate(valibot(addAuthorSchema)),
    reviewerForm: await superValidate({ language: baseLocale }, valibot(addReviewerSchema)),
    actionForm: await superValidate(valibot(projectActionSchema))
  };
};

async function verifyProduct(event: RequestEvent, Id: string) {
  return !!(await prisma.products.findFirst({
    where: { Id, ProjectId: parseInt(event.params.id) }
  }));
}

export const actions = {
  async deleteProduct(event) {
    // permissions checked in auth
    const form = await superValidate(event.request, valibot(productActionSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    // if user modified hidden values
    if (!(await verifyProduct(event, form.data.productId))) {
      return fail(403, { form, ok: false });
    }
    await DatabaseWrites.products.delete(form.data.productId);
    return { form, ok: true };
  },
  async deleteAuthor(event) {
    // permissions checked in auth
    const form = await superValidate(event.request, valibot(deleteSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    if (
      // if user modified hidden values
      !(await prisma.authors.findFirst({
        where: { Id: form.data.id, ProjectId: parseInt(event.params.id) }
      }))
    ) {
      return fail(403, { form, ok: false });
    }
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
    if (
      // if user modified hidden values
      !(await prisma.reviewers.findFirst({
        where: { Id: form.data.id, ProjectId: parseInt(event.params.id) }
      }))
    ) {
      return fail(403, { form, ok: false });
    }
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
    // if user modified hidden values
    if (!(await verifyProduct(event, form.data.productId))) {
      return fail(403, { form, ok: false });
    }
    await doProductAction(form.data.productId, form.data.productAction);

    return { form, ok: true };
  },
  async updateProduct(event) {
    // permissions checked in auth
    const form = await superValidate(event.request, valibot(updateProductPropertiesSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    // if user modified hidden values
    if (!(await verifyProduct(event, form.data.productId))) {
      return fail(403, { form, ok: false });
    }
    const productId = await DatabaseWrites.products.update(form.data.productId, {
      Properties: form.data.properties
    });

    return { form, ok: !!productId };
  },
  async addAuthor(event) {
    // permissions checked in auth
    const form = await superValidate(event.request, valibot(addAuthorSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const projectId = parseInt(event.params.id);
    if (
      // if user modified hidden values
      !(await prisma.organizationMemberships.findFirst({
        where: {
          UserId: form.data.author,
          Organization: {
            Projects: {
              some: { Id: projectId }
            }
          }
        }
      }))
    ) {
      return fail(403, { form, ok: false });
    }
    // ISSUE: #1101 Appears that CanUpdate is not used
    const author = await DatabaseWrites.authors.create({
      data: {
        ProjectId: projectId,
        UserId: form.data.author
      }
    });
    await Queues.UserTasks.add(`Add UserTasks for Author #${author.Id}`, {
      type: BullMQ.JobType.UserTasks_Modify,
      scope: 'Project',
      projectId,
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
    if (!form.valid || !form.data.operation) return fail(400, { form, ok: false });
    // prefer single project over array
    const project = await prisma.projects.findUniqueOrThrow({
      where: { Id: parseInt(event.params.id) },
      select: {
        Id: true,
        Name: true,
        DateArchived: true,
        OwnerId: true,
        GroupId: true,
        OrganizationId: true
      }
    });

    const session = (await event.locals.auth())!;

    await doProjectAction(
      form.data.operation,
      project,
      session,
      project.OrganizationId,
      form.data.operation === 'claim'
        ? (await userGroupsForOrg(session.user.userId, project.OrganizationId)).map(
            (g) => g.GroupId
          )
        : []
    );

    return { form, ok: true };
  }
} satisfies Actions;
