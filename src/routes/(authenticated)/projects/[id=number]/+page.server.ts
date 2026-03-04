import { error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad, RequestEvent } from './$types';
import { addAuthorSchema, addReviewerSchema } from './forms/valibot';
import { env } from '$env/dynamic/private';
import { baseLocale } from '$lib/paraglide/runtime';
import {
  ProductTransitionType,
  ProjectActionString,
  ProjectActionType,
  ProjectActionValue,
  RoleId
} from '$lib/prisma';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { projectActionSchema } from '$lib/projects';
import { doProjectAction, userGroupsForOrg } from '$lib/projects/server';
import { getProjectDetails, getProjectGroupData } from '$lib/projects/sse';
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
  const projectId = Number(params.id);
  if (isNaN(projectId)) throw error(404, 'Not Found');
  // Check authentication first, before any db calls
  // If the user is not logged in at all (locals.security.userId === null),
  // groups.findMany will error and security will not be handled
  locals.security.requireAuthenticated();
  locals.security.requireProjectReadAccess(
    await DatabaseReads.groups.findMany({
      where: { Users: { some: { Id: locals.security.userId } } },
      select: { Id: true }
    }),
    await DatabaseReads.projects.findUnique({
      where: { Id: projectId },
      select: { OwnerId: true, OrganizationId: true, GroupId: true }
    })
  );

  return {
    projectData: await getProjectDetails(projectId, locals.security.sessionForm),
    groupData: await getProjectGroupData(projectId, locals.security.sessionForm),
    authorForm: await superValidate(valibot(addAuthorSchema)),
    reviewerForm: await superValidate({ language: baseLocale }, valibot(addReviewerSchema)),
    actionForm: await superValidate(valibot(projectActionSchema)),
    jobsAvailable: QueueConnected(),
    showRebuildToggles: env.APP_ENV !== 'prd'
  };
}) satisfies PageServerLoad;

async function verifyProduct(event: RequestEvent, Id: string) {
  return !!(await DatabaseReads.products.findFirst({
    where: { Id, ProjectId: parseInt(event.params.id) }
  }));
}

export const actions = {
  async deleteProduct(event) {
    const projectId = parseInt(event.params.id);
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUnique({
        where: { Id: projectId },
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
    const product = await DatabaseReads.products.findUniqueOrThrow({
      where: {
        Id: form.data.productId
      },
      select: {
        ProductDefinitionId: true,
        WorkflowInstance: {
          select: { State: true }
        }
      }
    });
    await DatabaseWrites.products.delete(form.data.productId);
    await DatabaseWrites.projectActions.create({
      ProjectId: projectId,
      UserId: event.locals.security.userId,
      ActionType: ProjectActionType.Product,
      Action: ProjectActionString.RemoveProduct,
      Value: product.WorkflowInstance?.State,
      ExternalId: product.ProductDefinitionId
    });
    return { form, ok: true };
  },
  async deleteAuthor(event) {
    const ProjectId = parseInt(event.params.id);
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUnique({
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
        where: { UserId: form.data.id, ProjectId }
      }))
    ) {
      return fail(403, { form, ok: false });
    }
    const author = await DatabaseWrites.authors.delete(ProjectId, form.data.id);
    if (!author) return fail(404, { form, ok: false });
    await getQueues().UserTasks.add(
      `Remove UserTasks for Project #${ProjectId} Author #${form.data.id}`,
      {
        type: BullMQ.JobType.UserTasks_Workflow,
        scope: 'Project',
        projectId: parseInt(event.params.id),
        operation: {
          type: BullMQ.UserTasks.OpType.Delete,
          users: [form.data.id],
          roles: [RoleId.Author]
        }
      }
    );
    await DatabaseWrites.projectActions.create({
      ProjectId,
      UserId: event.locals.security.userId,
      ActionType: ProjectActionType.Author,
      Action: ProjectActionString.RemoveAuthor,
      ExternalId: form.data.id
    });
    return { form, ok: true };
  },
  async deleteReviewer(event) {
    const projectId = parseInt(event.params.id);
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUnique({
        where: { Id: projectId },
        select: { OwnerId: true, OrganizationId: true }
      })
    );
    if (!QueueConnected()) return error(503);
    const form = await superValidate(event.request, valibot(deleteSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const reviewer = await DatabaseReads.reviewers.findFirst({
      where: { Id: form.data.id, ProjectId: projectId },
      select: { Email: true }
    });
    if (!reviewer) {
      return fail(403, { form, ok: false });
    }
    await DatabaseWrites.reviewers.delete(form.data.id);
    await DatabaseWrites.projectActions.create({
      ProjectId: projectId,
      UserId: event.locals.security.userId,
      ActionType: ProjectActionType.Reviewer,
      Action: ProjectActionString.RemoveReviewer,
      Value: reviewer.Email
    });
    return { form, ok: true };
  },
  async addProduct(event) {
    const projectId = parseInt(event.params.id);
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUnique({
        where: { Id: projectId },
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
        RepositoryUrl: true
      }
    });
    if (!checkRepository?.RepositoryUrl) {
      return error(400, 'Project Repository not Yet Initialized');
    }
    await getQueues().Products.add(`Create Product for Project #${event.params.id}`, {
      type: BullMQ.JobType.Product_CreateLocal,
      projectId,
      productDefinitionId: form.data.productDefinitionId,
      storeId: form.data.storeId,
      userId: event.locals.security.userId
    });
    await DatabaseWrites.projectActions.create({
      ProjectId: projectId,
      UserId: event.locals.security.userId,
      ActionType: ProjectActionType.Product,
      Action: ProjectActionString.AddProduct,
      Value: (
        await DatabaseReads.stores.findFirst({
          where: { Id: form.data.storeId },
          select: { BuildEnginePublisherId: true }
        })
      )?.BuildEnginePublisherId,
      ExternalId: form.data.productDefinitionId
    });
    return { form, ok: true };
  },
  async productAction(event) {
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUnique({
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
    await doProductAction(
      form.data.productId,
      form.data.productAction,
      event.locals.security.userId
    );

    return { form, ok: true };
  },
  async updateProduct(event) {
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUnique({
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

    if (productId) {
      await DatabaseWrites.productTransitions.create({
        data: {
          UserId: event.locals.security.userId,
          ProductId: form.data.productId,
          Comment: form.data.properties,
          DateTransition: new Date(),
          TransitionType: ProductTransitionType.Update
        }
      });
    }

    return { form, ok: !!productId };
  },
  async addAuthor(event) {
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUnique({
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
      !(await DatabaseReads.groups.findFirst({
        where: {
          Users: { some: { Id: form.data.author } },
          Owner: {
            Projects: {
              some: { Id: projectId }
            }
          }
        }
      }))
    ) {
      return fail(400, { form, ok: false });
    }
    if (
      (await DatabaseReads.userRoles.count({
        where: {
          UserId: form.data.author,
          RoleId: RoleId.Author,
          Organization: {
            Projects: { some: { Id: projectId } }
          }
        }
      })) === 0
    ) {
      return fail(400, { form, ok: false });
    }
    // ISSUE: #1101 Appears that CanUpdate is not used
    await DatabaseWrites.authors.create({
      ProjectId: projectId,
      UserId: form.data.author
    });
    await getQueues().UserTasks.add(
      `Add UserTasks for Project #${projectId} Author #${form.data.author}`,
      {
        type: BullMQ.JobType.UserTasks_Workflow,
        scope: 'Project',
        projectId,
        operation: {
          type: BullMQ.UserTasks.OpType.Create,
          users: [form.data.author],
          roles: [RoleId.Author]
        }
      }
    );
    await DatabaseWrites.projectActions.create({
      ProjectId: projectId,
      UserId: event.locals.security.userId,
      ActionType: ProjectActionType.Author,
      Action: ProjectActionString.AddAuthor,
      ExternalId: form.data.author
    });
    return { form, ok: true };
  },
  async addReviewer(event) {
    const projectId = parseInt(event.params.id);
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUnique({
        where: { Id: projectId },
        select: { OwnerId: true, OrganizationId: true }
      })
    );
    const form = await superValidate(event.request, valibot(addReviewerSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.reviewers.create({
      Email: form.data.email,
      Name: form.data.name,
      Locale: form.data.language,
      ProjectId: projectId
    });
    await DatabaseWrites.projectActions.create({
      ProjectId: projectId,
      UserId: event.locals.security.userId,
      ActionType: ProjectActionType.Reviewer,
      Action: ProjectActionString.AddReviewer,
      Value: form.data.email
    });
    return { form, ok: true };
  },
  async toggleVisibility(event) {
    const projectId = parseInt(event.params.id);
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUnique({
        where: { Id: projectId },
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
    await DatabaseWrites.projects.update(projectId, {
      IsPublic: form.data.isPublic
    });
    await DatabaseWrites.projectActions.create({
      ProjectId: projectId,
      UserId: event.locals.security.userId,
      ActionType: ProjectActionType.EditField,
      Action: ProjectActionString.EditSettings,
      Value: form.data.isPublic ? ProjectActionValue.VisibilityOn : ProjectActionValue.VisibilityOff
    });
    return { form, ok: true };
  },
  async toggleDownload(event) {
    const projectId = parseInt(event.params.id);
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUnique({
        where: { Id: projectId },
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
    await DatabaseWrites.projects.update(projectId, {
      AllowDownloads: form.data.allowDownloads
    });
    await DatabaseWrites.projectActions.create({
      ProjectId: projectId,
      UserId: event.locals.security.userId,
      ActionType: ProjectActionType.EditField,
      Action: ProjectActionString.EditSettings,
      Value: form.data.allowDownloads
        ? ProjectActionValue.DownloadsOn
        : ProjectActionValue.DownloadsOff
    });
    return { form, ok: true };
  },
  async toggleAutoPublishOnRebuild(event) {
    const projectId = parseInt(event.params.id);
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUnique({
        where: { Id: projectId },
        select: { OwnerId: true, OrganizationId: true }
      })
    );

    const form = await superValidate(
      event.request,
      valibot(
        v.object({
          autoPublishOnRebuild: v.boolean()
        })
      )
    );
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.projects.update(projectId, {
      AutoPublishOnRebuild: form.data.autoPublishOnRebuild
    });
    await DatabaseWrites.projectActions.create({
      ProjectId: projectId,
      UserId: event.locals.security.userId,
      ActionType: ProjectActionType.EditField,
      Action: ProjectActionString.EditSettings,
      Value: form.data.autoPublishOnRebuild
        ? ProjectActionValue.AutoPublishOn
        : ProjectActionValue.AutoPublishOff
    });
    return { form, ok: true };
  },
  async toggleRebuildOnSoftwareUpdate(event) {
    const projectId = parseInt(event.params.id);
    event.locals.security.requireProjectWriteAccess(
      await DatabaseReads.projects.findUnique({
        where: { Id: projectId },
        select: { OwnerId: true, OrganizationId: true }
      })
    );

    const form = await superValidate(
      event.request,
      valibot(
        v.object({
          autoRebuildOnSoftwareUpdate: v.boolean()
        })
      )
    );
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.projects.update(projectId, {
      RebuildOnSoftwareUpdate: form.data.autoRebuildOnSoftwareUpdate
    });
    await DatabaseWrites.projectActions.create({
      ProjectId: projectId,
      UserId: event.locals.security.userId,
      ActionType: ProjectActionType.EditField,
      Action: ProjectActionString.EditSettings,
      Value: form.data.autoRebuildOnSoftwareUpdate
        ? ProjectActionValue.RebuildsOn
        : ProjectActionValue.RebuildsOff
    });
    return { form, ok: true };
  },
  async editOwnerGroup(event) {
    event.locals.security.requireAuthenticated(); // check this first, so unauthenticated can't dos db
    const form = await superValidate(event.request, valibot(updateOwnerGroupSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const projectId = parseInt(event.params.id);
    const project = await DatabaseReads.projects.findUnique({
      where: { Id: projectId },
      select: { OwnerId: true, OrganizationId: true, GroupId: true }
    });
    if (!project) return fail(404, { form, ok: false });
    // changing ownership
    if (project.OwnerId !== form.data.owner) {
      event.locals.security.requireProjectClaimable(
        await userGroupsForOrg(form.data.owner, project.OrganizationId),
        project,
        form.data.owner
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
    if (success) {
      if (project.GroupId !== form.data.group) {
        await DatabaseWrites.projectActions.create({
          ProjectId: projectId,
          UserId: event.locals.security.userId,
          ActionType: ProjectActionType.OwnerGroup,
          Action: ProjectActionString.AssignGroup,
          ExternalId: form.data.group
        });
      }
      if (project.OwnerId !== form.data.owner) {
        await DatabaseWrites.projectActions.create({
          ProjectId: projectId,
          UserId: event.locals.security.userId,
          ActionType: ProjectActionType.OwnerGroup,
          Action:
            form.data.owner === event.locals.security.userId
              ? ProjectActionString.Claim
              : ProjectActionString.AssignOwner,
          ExternalId: form.data.owner
        });
      }
    }
    return { form, ok: success };
  },
  async projectAction(event) {
    event.locals.security.requireAuthenticated(); // check this first, so unauthenticated can't dos db
    if (!QueueConnected()) return error(503);
    const form = await superValidate(event.request, valibot(projectActionSchema));
    if (!form.valid || !form.data.operation) return fail(400, { form, ok: false });
    // prefer single project over array
    const project = await DatabaseReads.projects.findUnique({
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
    if (!project) return fail(404, { form, ok: false });
    let groups: { Id: number }[] = [];

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
      groups.map((g) => g.Id)
    );

    return { form, ok: true };
  }
} satisfies Actions;
