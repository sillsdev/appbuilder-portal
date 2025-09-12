import type { Session } from '@auth/sveltekit';
import { error, redirect } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { RoleId } from '$lib/prisma';
import { QueueConnected } from '$lib/server/bullmq';
import { DatabaseReads } from '$lib/server/database';
import { Workflow } from '$lib/server/workflow';
import { isSuperAdmin } from '$lib/utils/roles';
import { WorkflowAction, WorkflowState, artifactLists } from '$lib/workflowTypes';

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

export const load = (async ({ params, locals }) => {
  const session = await locals.auth();
  if (!(await verifyCanViewTask(session!, params.product_id))) return error(403);
  const snap = await Workflow.getSnapshot(params.product_id);
  if (!snap) return error(404);

  // product will not be null if snap exists
  const product = (await DatabaseReads.products.findUnique({
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
          WorkflowAppProjectUrl: snap.context.includeFields.includes('projectURL'),
          Language: snap.context.includeFields.includes('projectLanguageCode'),
          Owner: {
            select: {
              Id: true,
              Name: snap.context.includeFields.includes('ownerName'),
              Email: snap.context.includeFields.includes('ownerEmail')
            }
          },
          Authors: {
            select: {
              UserId: true
            }
          },
          _count: {
            select: {
              Reviewers: true
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
          },
          ApplicationType: {
            select: {
              Description: true
            }
          }
        }
      },
      Store: {
        select: {
          Description: true
        }
      },
      StoreLanguage: {
        select: {
          Name: true
        }
      },
      ProductDefinition: {
        select: {
          Id: true,
          Name: true
        }
      }
    }
  }))!;

  const artifacts = snap.context.includeArtifacts
    ? await DatabaseReads.productArtifacts.findMany({
        where: {
          ProductId: params.product_id,
          ProductBuild: {
            BuildId: product.WorkflowBuildId
          },
          //filter by artifact type
          ArtifactType:
            snap.context.includeArtifacts === 'all'
              ? undefined
              : {
                  in: artifactLists(snap.context.includeArtifacts)
                }
        },
        select: {
          ArtifactType: true,
          FileSize: true,
          Url: true
        }
      })
    : [];

  const authorIds = new Set(product.Project.Authors.map((a) => a.UserId));
  const orgAdminIds = new Set(product.Project.Organization.UserRoles.map((a) => a.UserId));

  return {
    actions: Workflow.availableTransitionsFromName(snap.state, snap.input)
      .filter((a) =>
        filterAvailableActions(
          a,
          session?.user.userId,
          product.Project.Owner.Id,
          authorIds,
          orgAdminIds
        )
      )
      .map((a) => a[0].eventType as WorkflowAction),
    taskTitle: snap.state,
    instructions: snap.context.instructions,
    projectId: product.Project.Id,
    productDescription: product.ProductDefinition.Name,
    fields: {
      projectName: product.Project.Name,
      projectDescription: product.Project.Description,
      ownerName: product.Project.Owner.Name,
      ownerEmail: product.Project.Owner.Email,
      storeDescription:
        snap.context.includeFields.includes('storeDescription') && product.Store?.Description,
      listingLanguageCode:
        snap.context.includeFields.includes('listingLanguageCode') && product.StoreLanguage?.Name,
      projectURL: product.Project.WorkflowAppProjectUrl,
      displayProductDescription: snap.context.includeFields.includes('productDescription'),
      appType:
        snap.context.includeFields.includes('appType') &&
        product.Project.ApplicationType.Description,
      projectLanguageCode: product.Project.Language
    } as Fields,
    files: artifacts,
    reviewers: snap.context.includeReviewers
      ? await DatabaseReads.reviewers.findMany({
          where: {
            ProjectId: product.Project.Id
          },
          select: {
            Name: true,
            Email: true
          }
        })
      : [],
    taskForm: await superValidate(
      {
        state: snap.state as WorkflowState
      },
      valibot(sendActionSchema)
    ),
    jobsAvailable: QueueConnected()
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, params, locals }) => {
    const session = (await locals.auth())!;
    if (!(await verifyCanViewTask(session, params.product_id))) return error(403);
    if (!QueueConnected()) return error(503);
    const form = await superValidate(request, valibot(sendActionSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const flow = await Workflow.restore(params.product_id);

    if (!flow) return fail(404, { form, ok: false });
    if (
      form.data.flowAction === WorkflowAction.Jump ||
      form.data.flowAction === WorkflowAction.Migrate
    ) {
      return fail(400, {
        form,
        ok: false
      });
    }
    //double check that state matches current snapshot
    const snap = (await Workflow.getSnapshot(params.product_id))!;
    const old = flow.state()!;
    const transition = Workflow.availableTransitionsFromName(old, snap.input)
      .find((t) => t[0].eventType === form.data.flowAction)
      ?.at(0);
    if (transition && form.data.state === flow.state()) {
      flow.send({
        type: form.data.flowAction,
        comment: form.data.comment,
        userId: session.user.userId
      });

      const product = (await DatabaseReads.products.findUnique({
        where: { Id: params.product_id },
        select: {
          Project: {
            select: {
              Id: true,
              Owner: {
                select: {
                  Id: true
                }
              },
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
          }
        }
      }))!;

      const authorIds = new Set(product.Project.Authors.map((a) => a.UserId));
      const orgAdminIds = new Set(product.Project.Organization.UserRoles.map((a) => a.UserId));

      const targetState = transition.target;

      const availableTransitions = targetState
        ? Workflow.availableTransitionsFromNode(targetState[0], snap.input).filter((a) =>
            filterAvailableActions(
              a,
              session?.user.userId,
              product.Project.Owner.Id,
              authorIds,
              orgAdminIds
            )
          )
        : [];

      if (availableTransitions.length) {
        redirect(302, localizeHref(`/tasks/${params.product_id}`));
      } else {
        redirect(302, localizeHref(`/projects/${product.Project.Id}`));
      }
    }
  }
} satisfies Actions;

// allowed if SuperAdmin, or the user has a UserTask for the Product
async function verifyCanViewTask(session: Session | null, productId: string): Promise<boolean> {
  if (!session) return false;

  return (
    isSuperAdmin(session.user.roles) ||
    !!(await DatabaseReads.userTasks.findFirst({
      where: {
        ProductId: productId,
        UserId: session.user.userId
      },
      select: {
        Id: true
      }
    }))
  );
}

function filterAvailableActions(
  action: ReturnType<typeof Workflow.availableTransitionsFromName>[number],
  userId: number | undefined,
  ownerId: number,
  authors: Set<number>,
  orgAdmins: Set<number>
): boolean {
  if (userId === undefined) return false;
  switch (action[0].meta?.user) {
    case RoleId.AppBuilder:
      return userId === ownerId;
    case RoleId.Author:
      return authors.has(userId);
    case RoleId.OrgAdmin:
      return orgAdmins.has(userId);
    default:
      return false;
  }
}
