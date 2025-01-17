import type { Session } from '@auth/sveltekit';
import { error, redirect } from '@sveltejs/kit';
import { prisma, Workflow } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { WorkflowAction, WorkflowState } from 'sil.appbuilder.portal.common/workflow';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const sendActionSchema = v.object({
  state: v.enum(WorkflowState),
  flowAction: v.enum(WorkflowAction),
  comment: v.string()
});

type Fields = {
  ownerName?: string; //Product.Project.Owner.Name
  ownerEmail?: string; //Product.Project.Owner.Email
  projectName: string; //Product.Project.Name
  projectDescription: string; //Product.Project.Description
  storeDescription?: string; //Product.Store.Description
  listingLanguageCode?: string; //Product.StoreLanguage.Name
  projectURL?: string; //Product.Project.WorkflowAppProjectURL
  displayProductDescription: boolean; //Product.ProductDefinition.Description
  appType?: string; //Product.ProductDefinition.ApplicationTypes.Description
  projectLanguageCode?: string; //Product.Project.Language
};

export const load = (async ({ params, url, locals }) => {
  const session = await locals.auth();
  if (!(await verifyCanViewTask(session!, params.product_id))) return error(403);
  const snap = await Workflow.getSnapshot(params.product_id);
  if (!snap) return error(404);

  const product = await prisma.products.findUnique({
    where: {
      Id: params.product_id
    },
    select: {
      WorkflowBuildId: true,
      Project: {
        select: {
          Id: true,
          Name: true,
          Description: true,
          WorkflowAppProjectUrl: snap?.context.includeFields.includes('projectURL'),
          Language: snap?.context.includeFields.includes('projectLanguageCode'),
          Owner: {
            select: {
              Id: true,
              Name: snap?.context.includeFields.includes('ownerName'),
              Email: snap?.context.includeFields.includes('ownerEmail')
            }
          },
          //conditionally include reviewers
          Reviewers: snap?.context.includeReviewers
            ? {
              select: {
                Id: true,
                Name: true,
                Email: true
              }
            }
            : undefined,
          Authors: {
            select: {
              UserId: true
            }
          },
          Organization: {
            select: {
              UserRoles: {
                where: {
                  RoleId: RoleId.OrgAdmin
                }
              }
            }
          }
        }
      },
      Store: snap?.context.includeFields.includes('storeDescription')
        ? {
          select: {
            Description: true
          }
        }
        : undefined,
      StoreLanguage: snap?.context.includeFields.includes('listingLanguageCode')
        ? {
          select: {
            Name: true
          }
        }
        : undefined,
      ProductDefinition: {
        select: {
          Name: true,
          ApplicationTypes: snap?.context.includeFields.includes('appType')
            ? {
              select: {
                Description: true
              }
            }
            : undefined
        }
      }
    }
  });

  const artifacts = snap?.context.includeArtifacts
    ? await prisma.productArtifacts.findMany({
      where: {
        ProductId: params.product_id,
        ProductBuild: {
          BuildId: product?.WorkflowBuildId
        },
        //filter by artifact type
        ArtifactType:
            typeof snap.context.includeArtifacts === 'string'
              ? snap.context.includeArtifacts
              : undefined //include all
      },
      select: {
        ProductBuildId: true,
        ArtifactType: true,
        FileSize: true,
        Url: true,
        Id: true
      }
    })
    : [];

  return {
    actions: Workflow.availableTransitionsFromName(snap.state, snap.config)
      .filter((a) => {
        if (session?.user.userId === undefined) return false;
        switch (a[0].meta?.user) {
        case RoleId.AppBuilder:
          return session.user.userId === product?.Project.Owner.Id;
        case RoleId.Author:
          return product?.Project.Authors.map((a) => a.UserId).includes(session.user.userId);
        case RoleId.OrgAdmin:
          return product?.Project.Organization.UserRoles.map((u) => u.UserId).includes(
            session.user.userId
          );
        default:
          return false;
        }
      })
      .map((a) => a[0].eventType as WorkflowAction),
    taskTitle: snap?.state,
    instructions: snap?.context.instructions,
    projectId: product?.Project.Id,
    productDescription: product?.ProductDefinition.Name,
    fields: {
      projectName: product?.Project.Name,
      projectDescription: product?.Project.Description,
      ownerName: product?.Project.Owner.Name,
      ownerEmail: product?.Project.Owner.Email,
      storeDescription: product?.Store?.Description,
      listingLanguageCode: product?.StoreLanguage?.Name,
      projectURL: product?.Project.WorkflowAppProjectUrl,
      displayProductDescription: snap?.context.includeFields.includes('productDescription'),
      appType: product?.ProductDefinition.ApplicationTypes.Description,
      projectLanguageCode: product?.Project.Language
    } as Fields,
    files: artifacts,
    reviewers: product?.Project.Reviewers,
    taskForm: await superValidate(
      {
        state: snap?.state as WorkflowState
      },
      valibot(sendActionSchema)
    )
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, params, locals }) => {
    const session = await locals.auth();
    if (!(await verifyCanViewTask(session, params.product_id))) return error(403);
    const form = await superValidate(request, valibot(sendActionSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const flow = await Workflow.restore(params.product_id);

    if (!flow) return fail(404, { form, ok: false });

    //double check that state matches current snapshot
    if (form.data.state === flow.state()) {
      flow.send({
        type: form.data.flowAction,
        comment: form.data.comment,
        userId: session?.user.userId ?? null
      });
    }

    const product = await prisma.products.findUnique({
      where: { Id: params.product_id },
      select: { ProjectId: true }
    });

    redirect(302, `/projects/${product?.ProjectId}`);
  }
} satisfies Actions;

// allowed if SuperAdmin, or the user has a UserTask for the Product
async function verifyCanViewTask(session: Session | null, productId: string): Promise<boolean> {
  if (!session) return false;
  if (session.user.roles.find(([org, role]) => role === RoleId.SuperAdmin)) return true;

  return !!(await prisma.userTasks.findFirst({
    where: {
      ProductId: productId,
      UserId: session.user.userId
    },
    select: {
      Id: true
    }
  }));
}
