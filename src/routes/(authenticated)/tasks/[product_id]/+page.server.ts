import type { Prisma } from '@prisma/client';
import { error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { RoleId } from '$lib/prisma';
import { projectUrl } from '$lib/projects/server';
import { QueueConnected } from '$lib/server/bullmq';
import { DatabaseReads } from '$lib/server/database';
import { Workflow } from '$lib/server/workflow';
import { WorkflowAction, WorkflowState, artifactLists } from '$lib/workflowTypes';

const sendActionSchema = v.object({
  state: v.enum(WorkflowState),
  flowAction: v.enum(WorkflowAction),
  comment: v.string(),
  options: v.optional(v.array(v.string()))
});

type Fields = {
  ownerName?: string; //Product.Project.Owner.Name
  ownerEmail?: string; //Product.Project.Owner.Email
  projectName: string; //Product.Project.Name
  projectDescription: string; //Product.Project.Description
  storeDescription?: string; //Product.Store.Description
  listingLanguageCode?: string; //Product.StoreLanguage.Name
  projectURL?: string; // Origin URL + /projects/[Project.Id]
  displayProductDescription: boolean; //Product.ProductDefinition.Description
  appType?: string; //Product.ProductDefinition.ApplicationTypes.Description
  projectLanguageCode?: string; //Product.Project.Language
};

export const load = (async ({ params, locals, depends }) => {
  depends('task:id:load');
  // Auth handled in verifyCanViewTask
  locals.security.requireAuthenticated();
  if (!(await verifyCanViewTask(locals.security, params.product_id))) return error(403);
  const snap = await Workflow.getSnapshot(params.product_id);
  if (!snap) return error(404);

  // product will not be null if snap exists
  const product = (await DatabaseReads.products.findUnique({
    where: {
      Id: params.product_id
    },
    select: {
      CurrentBuildId: true,
      Project: {
        select: {
          Id: true,
          Name: true,
          Description: true,
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
                },
                select: {
                  UserId: true
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
          Description: true
        }
      },
      ProductDefinition: {
        select: {
          Id: true,
          Name: true
        }
      },
      ProductPublications:
        snap.context.includeArtifacts === 'error'
          ? {
              select: {
                LogUrl: true,
                Success: true,
                Channel: true,
                DateResolved: true,
                DateUpdated: true
              },
              orderBy: {
                DateUpdated: 'desc'
              },
              take: 1
            }
          : undefined,
      ProductTransitions: {
        where: {
          DateTransition: { not: null }
        },
        select: {
          InitialState: true,
          Comment: true
        },
        orderBy: { DateTransition: 'desc' },
        take: 1
      }
    }
  }))!;

  const artifacts =
    snap.context.includeArtifacts && product.CurrentBuildId
      ? await DatabaseReads.productArtifacts.findMany({
          where: {
            ProductId: params.product_id,
            BuildEngineBuildId: product.CurrentBuildId,
            //filter by artifact type
            ArtifactType:
              snap.context.includeArtifacts === 'all' || snap.context.includeArtifacts === 'error'
                ? undefined
                : {
                    in: artifactLists(snap.context.includeArtifacts)
                  }
          },
          select: {
            ArtifactType: true,
            FileSize: true,
            Url: true
          },
          orderBy: {
            ArtifactType: 'asc'
          }
        })
      : [];

  return {
    loadTime: new Date().valueOf(),
    actions: Workflow.availableTransitionsFromName(snap.state, snap.input)
      .filter((a) => filterAvailableActions(a, locals.security.userId, product.Project))
      .map((a) => a[0].eventType as WorkflowAction),
    taskTitle: snap.state,
    previousTask: product.ProductTransitions.at(0),
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
        snap.context.includeFields.includes('listingLanguageCode') &&
        product.StoreLanguage?.Description,
      projectURL:
        snap.context.includeFields.includes('projectURL') && projectUrl(product.Project.Id),
      displayProductDescription: snap.context.includeFields.includes('productDescription'),
      appType:
        snap.context.includeFields.includes('appType') &&
        product.Project.ApplicationType.Description,
      projectLanguageCode: product.Project.Language
    } as Fields,
    files: artifacts,
    release: snap.context.includeArtifacts === 'error' && product.ProductPublications?.at(0),
    releaseErrors:
      snap.context.includeArtifacts === 'error' &&
      product.ProductPublications?.at(0)?.LogUrl &&
      (
        await fetch(product.ProductPublications[0]!.LogUrl!)
          .then((r) => r.text())
          .catch((r) => '')
      ).match(/^.*Google Api Error.*$/gim),
    reviewers: snap.context.includeReviewers
      ? await DatabaseReads.reviewers.findMany({
          where: {
            ProjectId: product.Project.Id
          },
          select: {
            Name: true,
            Email: true
          },
          orderBy: {
            Name: 'asc'
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
    // Auth handled in verifyCanViewTask
    locals.security.requireAuthenticated();
    if (!(await verifyCanViewTask(locals.security, params.product_id))) return error(403);
    if (!QueueConnected()) return error(503);
    const form = await superValidate(request, valibot(sendActionSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const flow = await Workflow.restore(params.product_id);

    if (!flow) return fail(404, { form, ok: false });
    if (form.data.flowAction === WorkflowAction.Jump) {
      return fail(400, {
        form,
        ok: false
      });
    }
    //double check that state matches current snapshot
    const snap = (await Workflow.getSnapshot(params.product_id))!;
    const old = flow.state()!;
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
                  },
                  select: {
                    UserId: true
                  }
                }
              }
            }
          }
        }
      }
    }))!;

    const transition = Workflow.availableTransitionsFromName(old, snap.input)
      .filter((a) => filterAvailableActions(a, locals.security.userId, product.Project))
      .find((t) => t[0].eventType === form.data.flowAction)
      ?.at(0);
    if (transition && form.data.state === flow.state()) {
      flow.send({
        type: form.data.flowAction,
        comment: form.data.comment,
        userId: locals.security.userId,
        options: form.data.options
      });

      const targetState = transition.target;

      const availableTransitions = targetState
        ? Workflow.availableTransitionsFromNode(targetState[0], snap.input).filter((a) =>
            filterAvailableActions(a, locals.security.userId, product.Project)
          )
        : [];

      return {
        form,
        ok: true,
        hasTarget: !!targetState,
        hasTransitions: !!availableTransitions.length
      };
    } else {
      return fail(400, {
        form,
        ok: false
      });
    }
  }
} satisfies Actions;

// allowed if SuperAdmin, or the user has a UserTask for the Product
async function verifyCanViewTask(security: Security, productId: string): Promise<boolean> {
  if (!security) return false;

  return (
    security.isSuperAdmin ||
    !!(await DatabaseReads.userTasks.findFirst({
      where: {
        ProductId: productId,
        UserId: security.userId
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
  project: Prisma.ProjectsGetPayload<{
    select: {
      Owner: { select: { Id: true } };
      Authors: { select: { UserId: true } };
      Organization: {
        select: {
          UserRoles: { select: { UserId: true } };
        };
      };
    };
  }>
): boolean {
  if (userId === undefined) return false;
  return action.some((a) => {
    switch (a.meta?.user) {
      case RoleId.AppBuilder:
        return userId === project.Owner.Id;
      case RoleId.Author:
        return !!project.Authors.find((u) => u.UserId === userId);
      case RoleId.OrgAdmin:
        return !!project.Organization.UserRoles.find((u) => u.UserId === userId);
      default:
        return false;
    }
  });
}
