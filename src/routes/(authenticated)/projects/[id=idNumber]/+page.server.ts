import { error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad, RequestEvent } from './$types';
import { addAuthorSchema, addReviewerSchema } from './forms/valibot';
import { baseLocale } from '$lib/paraglide/runtime';
import { RoleId } from '$lib/prisma';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { projectActionSchema } from '$lib/projects';
import { doProjectAction, userGroupsForOrg } from '$lib/projects/server';
import { getProjectDetails } from '$lib/projects/sse';
import { BullMQ, QueueConnected, getQueues } from '$lib/server/bullmq';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { deleteSchema, idSchema, propertiesSchema, stringIdSchema } from '$lib/valibot';

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

export const load = (async ({ locals, params }) => {
  locals.security.requireProjectReadAccess(
    await DatabaseReads.groupMemberships.findMany({
      where: { UserId: locals.security.userId },
      select: { GroupId: true }
    }),
    await DatabaseReads.projects.findUniqueOrThrow({
      where: { Id: parseInt(params.id) },
      select: { OwnerId: true, OrganizationId: true, GroupId: true }
    })
  );
  if (isNaN(parseInt(params.id))) throw error(404, 'Not Found');
  return {
    projectData: await getProjectDetails(parseInt(params.id), locals.security),
    authorForm: await superValidate(valibot(addAuthorSchema)),
    reviewerForm: await superValidate({ language: baseLocale }, valibot(addReviewerSchema)),
    actionForm: await superValidate(valibot(projectActionSchema)),
    jobsAvailable: QueueConnected()
  };
}) satisfies PageServerLoad;

async function verifyProduct(event: RequestEvent, Id: string) {
  return !!(await DatabaseReads.products.findFirst({
    where: { Id, ProjectId: parseInt(event.params.id) }
  }));
}

export const actions = {
  async deleteProduct(event) {
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUniqueOrThrow({
        where: { Id: parseInt(event.params.id) },
        select: { OwnerId: true, OrganizationId: true }
      })
    );
    if (!QueueConnected()) return error(503);
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
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUniqueOrThrow({
        where: { Id: parseInt(event.params.id) },
        select: { OwnerId: true, OrganizationId: true }
      })
    );
    if (!QueueConnected()) return error(503);
    const form = await superValidate(event.request, valibot(deleteSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    if (
      // if user modified hidden values
      !(await DatabaseReads.authors.findFirst({
        where: { Id: form.data.id, ProjectId: parseInt(event.params.id) }
      }))
    ) {
      return fail(403, { form, ok: false });
    }
    const author = await DatabaseWrites.authors.delete(form.data.id);
    if (!author) return fail(404, { form, ok: false });
    await getQueues().UserTasks.add(`Remove UserTasks for Author #${form.data.id}`, {
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
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUniqueOrThrow({
        where: { Id: parseInt(event.params.id) },
        select: { OwnerId: true, OrganizationId: true }
      })
    );
    if (!QueueConnected()) return error(503);
    const form = await superValidate(event.request, valibot(deleteSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    if (
      // if user modified hidden values
      !(await DatabaseReads.reviewers.findFirst({
        where: { Id: form.data.id, ProjectId: parseInt(event.params.id) }
      }))
    ) {
      return fail(403, { form, ok: false });
    }
    await DatabaseWrites.reviewers.delete(form.data.id);
    return { form, ok: true };
  },
  async addProduct(event) {
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUniqueOrThrow({
        where: { Id: parseInt(event.params.id) },
        select: { OwnerId: true, OrganizationId: true }
      })
    );
    if (!QueueConnected()) return error(503);
    const form = await superValidate(event.request, valibot(addProductSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const checkRepository = await DatabaseReads.projects.findUnique({
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
    getQueues().Products.add(`Create Product for Project #${event.params.id}`, {
      type: BullMQ.JobType.Product_CreateLocal,
      projectId: parseInt(event.params.id),
      productDefinitionId: form.data.productDefinitionId,
      storeId: form.data.storeId
    });

    return { form, ok: true };
  },
  async productAction(event) {
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUniqueOrThrow({
        where: { Id: parseInt(event.params.id) },
        select: { OwnerId: true, OrganizationId: true }
      })
    );
    if (!QueueConnected()) return error(503);
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
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUniqueOrThrow({
        where: { Id: parseInt(event.params.id) },
        select: { OwnerId: true, OrganizationId: true }
      })
    );
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
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUniqueOrThrow({
        where: { Id: parseInt(event.params.id) },
        select: { OwnerId: true, OrganizationId: true }
      })
    );
    if (!QueueConnected()) return error(503);
    const form = await superValidate(event.request, valibot(addAuthorSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const projectId = parseInt(event.params.id);
    if (
      // if user modified hidden values
      !(await DatabaseReads.organizationMemberships.findFirst({
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
      ProjectId: projectId,
      UserId: form.data.author
    });
    await getQueues().UserTasks.add(`Add UserTasks for Author #${author.Id}`, {
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
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUniqueOrThrow({
        where: { Id: parseInt(event.params.id) },
        select: { OwnerId: true, OrganizationId: true }
      })
    );
    const form = await superValidate(event.request, valibot(addReviewerSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.reviewers.create({
      Email: form.data.email,
      Name: form.data.name,
      Locale: form.data.language,
      ProjectId: parseInt(event.params.id)
    });
    return { form, ok: true };
  },
  async toggleVisibility(event) {
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUniqueOrThrow({
        where: { Id: parseInt(event.params.id) },
        select: { OwnerId: true, OrganizationId: true }
      })
    );
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
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUniqueOrThrow({
        where: { Id: parseInt(event.params.id) },
        select: { OwnerId: true, OrganizationId: true }
      })
    );
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
    event.locals.security.requireAuthenticated(); // check this first, so unauthenticated can't dos db
    const form = await superValidate(event.request, valibot(updateOwnerGroupSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const projectId = parseInt(event.params.id);
    const project = await DatabaseReads.projects.findUniqueOrThrow({
      where: { Id: projectId },
      select: { OwnerId: true, OrganizationId: true, GroupId: true }
    });
    // changing ownership
    if (project.OwnerId !== form.data.owner) {
      event.locals.security.requireProjectClaimable(
        await userGroupsForOrg(form.data.owner, project.OrganizationId),
        project
      );
      if (!QueueConnected()) return error(503);
    }
    // changing group
    if (project.GroupId !== form.data.group) {
      event.locals.security.requireProjectWriteAccess(project);
    }
    const success = await DatabaseWrites.projects.update(projectId, {
      GroupId: form.data.group,
      OwnerId: form.data.owner
    });
    return { form, ok: success };
  },
  async projectAction(event) {
    event.locals.security.requireAuthenticated(); // check this first, so unauthenticated can't dos db
    if (!QueueConnected()) return error(503);
    const form = await superValidate(event.request, valibot(projectActionSchema));
    if (!form.valid || !form.data.operation) return fail(400, { form, ok: false });
    // prefer single project over array
    const project = await DatabaseReads.projects.findUniqueOrThrow({
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

    let groups: { GroupId: number }[] = [];

    if (form.data.operation === 'claim') {
      groups = await userGroupsForOrg(event.locals.security.userId, project.OrganizationId);
      event.locals.security.requireProjectClaimable(groups, project);
    } else {
      event.locals.security.requireProjectWriteAccess(project);
    }

    await doProjectAction(
      form.data.operation,
      project,
      event.locals.security,
      project.OrganizationId,
      groups.map((g) => g.GroupId)
    );

    return { form, ok: true };
  }
} satisfies Actions;
