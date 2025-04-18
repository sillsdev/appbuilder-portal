import { localizeHref } from '$lib/paraglide/runtime';
import { importJSONSchema } from '$lib/projects';
import { verifyCanCreateProject } from '$lib/projects/server';
import { idSchema } from '$lib/valibot';
import { error, redirect } from '@sveltejs/kit';
import { BullMQ, DatabaseWrites, prisma, Queues } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const projectsImportSchema = v.object({
  group: idSchema,
  type: idSchema,
  // I would use v.file, but that is not supported until after Node 18
  json: v.pipe(
    importJSONSchema,
    v.transform((i) => JSON.stringify(i))
  )
});

export const load = (async ({ locals, params }) => {
  if (!verifyCanCreateProject((await locals.auth())!, parseInt(params.id))) return error(403);

  const organization = await prisma.organizations.findUnique({
    where: {
      Id: parseInt(params.id)
    },
    select: {
      Id: true,
      Groups: {
        select: {
          Id: true,
          Name: true
        }
      },
      OrganizationProductDefinitions: {
        select: {
          ProductDefinition: {
            select: {
              ApplicationTypes: {
                select: {
                  Id: true,
                  Description: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!organization) return error(404);

  const types = await prisma.applicationTypes.findMany({
    select: {
      Id: true,
      Description: true
    }
  });

  const form = await superValidate(
    {
      group: organization.Groups.at(0)?.Id ?? undefined,
      type: types?.at(0)?.Id ?? undefined
    },
    valibot(projectsImportSchema),
    { errors: false } // prevents form from showing errors on init
  );
  return { form, organization, types };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async function (event) {
    const session = (await event.locals.auth())!;

    const organizationId = parseInt(event.params.id);

    if (isNaN(organizationId)) return error(404);

    if (!verifyCanCreateProject(session, organizationId)) return error(403);

    const form = await superValidate(event.request, valibot(projectsImportSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    const organization = await prisma.organizations.findUnique({
      where: {
        Id: organizationId
      },
      select: {
        Name: true
      }
    });

    if (!organization) return error(404);
    const errors: {
      path: string;
      messages: string[];
    }[] = [];

    // this will always be successful because it has already passed the original form validation
    const importJSON = v.safeParse(importJSONSchema, form.data.json).output as v.InferOutput<
      typeof importJSONSchema
    >;

    await Promise.all(
      importJSON.Products.map(async (product, i) => {
        const prodDef = await prisma.productDefinitions.findFirst({
          where: {
            Name: product.Name
          },
          select: {
            Id: true,
            _count: {
              select: {
                OrganizationProductDefinitions: {
                  where: {
                    OrganizationId: organizationId
                  }
                }
              }
            }
          }
        });

        // ISSUE: #1116 i18n for server-side errors
        if (!prodDef) {
          errors.push({
            path: `json.Products[${i}].Name`,
            messages: [`Could not find ProductDefinition: "${product.Name}"`]
          });
        } else if (!prodDef?._count.OrganizationProductDefinitions) {
          errors.push({
            path: `json.Products[${i}].Name`,
            messages: [
              `Invalid ProductDefinition: "${product.Name}" for Organization: ${organization.Name}`
            ]
          });
        }

        const store = await prisma.stores.findFirst({
          where: {
            Name: product.Store
          },
          select: {
            Id: true,
            _count: {
              select: {
                OrganizationStores: {
                  where: {
                    OrganizationId: organizationId
                  }
                }
              }
            }
          }
        });

        // ISSUE: #1116 i18n for server-side errors
        if (!store) {
          errors.push({
            path: `json.Products[${i}].Store`,
            messages: [`Could not find Store: "${product.Store}"`]
          });
        } else if (!store?._count.OrganizationStores) {
          errors.push({
            path: `json.Products[${i}].Store`,
            messages: [`Invalid Store: "${product.Store}" for Organization: ${organization.Name}`]
          });
        }
        return {
          ProductDefinitionId: prodDef?.Id,
          StoreId: store?.Id
        };
      })
    );

    if (!errors.length) {
      const imp = await DatabaseWrites.projectImports.create({
        data: {
          ImportData: JSON.stringify(form.data.json),
          TypeId: form.data.type,
          OwnerId: session.user.userId,
          GroupId: form.data.group,
          OrganizationId: organizationId
        },
        select: {
          Id: true
        }
      });
      const projects = await DatabaseWrites.projects.createMany(
        importJSON.Projects.map((pj) => {
          return {
            OrganizationId: organizationId,
            Name: pj.Name,
            GroupId: form.data.group,
            OwnerId: session.user.userId,
            Language: pj.Language,
            TypeId: form.data.type,
            Description: pj.Description ?? '',
            IsPublic: pj.IsPublic,
            ImportId: imp.Id
          };
        })
      );

      if (projects) {
        // Create products
        await Queues.Miscellaneous.addBulk(
          projects.map((p) => ({
            name: `Create Project #${p}`,
            data: {
              type: BullMQ.JobType.Project_Create,
              projectId: p
            }
          }))
        );
      }
    }

    if (errors.length) {
      return fail(400, { form, ok: false, errors });
    }

    return redirect(302, localizeHref(`/projects/own/${organizationId}`));
  }
};
