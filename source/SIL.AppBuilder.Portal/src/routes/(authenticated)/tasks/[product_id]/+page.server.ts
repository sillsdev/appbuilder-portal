import type { PageServerLoad, Actions } from './$types';
import { prisma, Workflow } from 'sil.appbuilder.portal.common';
import { redirect } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';

const sendActionSchema = v.object({
  state: v.string(),
  flowAction: v.string(),
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
  productDescription?: string; //Product.ProductDefinition.Description
  appType?: string; //Product.ProductDefinition.ApplicationTypes.Description
  projectLanguageCode?: string; //Product.Project.Language
};

export const load = (async ({ params, url, locals }) => {
  const session = await locals.auth();
  // TODO: permission check
  const flow = await Workflow.restore(params.product_id);
  const snap = await Workflow.getSnapshot(params.product_id);

  const product = await prisma.products.findUnique({
    where: {
      Id: params.product_id
    },
    select: {
      WorkflowBuildId: true,
      Project: {
        select: {
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
          Name: snap?.context.includeFields.includes('productDescription'),
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
          ContentType: true,
          FileSize: true,
          Url: true,
          Id: true
        }
      })
    : [];

  return {
    actions: flow
      .availableTransitions()
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
      .map((a) => a[0].eventType as string),
    taskTitle: snap?.value,
    instructions: snap?.context.instructions,
    fields: {
      projectName: product?.Project.Name,
      projectDescription: product?.Project.Description,
      ownerName: product?.Project.Owner.Name,
      ownerEmail: product?.Project.Owner.Email,
      storeDescription: product?.Store?.Description,
      listingLanguageCode: product?.StoreLanguage?.Name,
      projectURL: product?.Project.WorkflowAppProjectUrl,
      productDescription: product?.ProductDefinition.Name,
      appType: product?.ProductDefinition.ApplicationTypes.Description,
      projectLanguageCode: product?.Project.Language
    } as Fields,
    files: artifacts,
    reviewers: product?.Project.Reviewers
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, params, locals }) => {
    // TODO: permission check
    const session = await locals.auth();
    const form = await superValidate(request, valibot(sendActionSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const flow = await Workflow.restore(params.product_id);

    //double check that state matches current snapshot
    if (form.data.state === flow.state()) {
      flow.send({
        type: form.data.flowAction,
        comment: form.data.comment,
        userId: session?.user.userId ?? null
      });
    }

    redirect(302, '/tasks');
  }
} satisfies Actions;
