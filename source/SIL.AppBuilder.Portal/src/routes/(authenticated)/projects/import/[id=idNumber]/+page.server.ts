import { idSchema } from '$lib/valibot';
import { error } from '@sveltejs/kit';
import { DatabaseWrites, prisma, type Prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { queues, BullMQ } from 'sil.appbuilder.portal.common';
import { verifyCanCreateProject } from '$lib/projects/common.server';
import { importJSONSchema } from '$lib/projects/common';

const projectsImportSchema = v.object({
  group: idSchema,
  type: idSchema,
  // I would use v.file, but that is not supported until after Node 18
  json: importJSONSchema
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
    where: {
      ProductDefinitions: {
        some: {
          OrganizationProductDefinitions: {
            every: {
              OrganizationId: organization.Id
            }
          }
        }
      }
    },
    select: {
      Id: true,
      Description: true
    }
  });

  const form = await superValidate(
    {
      group: organization?.Groups[0]?.Id ?? undefined,
      type: types?.[0].Id ?? undefined
    },
    valibot(projectsImportSchema)
  );
  return { form, organization, types };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async function (event) {
    const session = (await event.locals.auth())!;
    if (!verifyCanCreateProject(session, parseInt(event.params.id))) return error(403);

    const form = await superValidate(event.request, valibot(projectsImportSchema));
    // TODO: Return/Display error messages
    if (!form.valid) return fail(400, { form, ok: false });
    if (isNaN(parseInt(event.params.id))) return fail(400, { form, ok: false });

    console.log(JSON.stringify(form, null, 4));

    const organization = await prisma.organizations.findUnique({
      where: {
        Id: parseInt(event.params.id)
      },
      select: {
        Id: true,
        Name: true
      }
    });

    if (!organization) return error(404);

    const errors: any[] = [];

    const products = await Promise.all(
      form.data.json.Products.map(async (p) => {
        const pdi = (
          await prisma.productDefinitions.findFirst({
            where: {
              Name: p.Name,
              OrganizationProductDefinitions: {
                some: {
                  OrganizationId: organization.Id
                }
              }
            },
            select: {
              Id: true
            }
          })
        )?.Id;

        if (pdi === undefined) {
          // TODO: better errors
          errors.push(
            `Could not find ProductDefinition: "${p.Name}" for Organization: ${organization.Name}`
          );
        }

        const si = (
          await prisma.stores.findFirst({
            where: {
              Name: p.Store,
              OrganizationStores: {
                some: {
                  OrganizationId: organization.Id
                }
              }
            },
            select: {
              Id: true
            }
          })
        )?.Id;

        if (si === undefined) {
          errors.push(`Could not find Store: "${p.Store}" for Organization: ${organization.Name}`);
        }
        return {
          ProductDefinitionId: pdi,
          StoreId: si
        };
      })
    );

    console.log(JSON.stringify(products, null, 4));

    if (!errors.length) {
      const timestamp = new Date();
      const imp = await DatabaseWrites.projectImports.create({
        data: {
          ImportData: JSON.stringify(form.data.json),
          TypeId: form.data.type,
          OwnerId: session.user.userId,
          GroupId: form.data.group,
          OrganizationId: organization.Id,
          DateCreated: timestamp,
          DateUpdated: timestamp
        },
        select: {
          Id: true
        }
      });
      const projects = await DatabaseWrites.projects.createMany(
        form.data.json.Projects.map((pj) => {
          const timestamp = new Date();
          return {
            OrganizationId: organization.Id,
            Name: pj.Name,
            GroupId: form.data.group,
            OwnerId: session.user.userId,
            Language: pj.Language, // TODO: validate language code?
            TypeId: form.data.type,
            Description: pj.Description ?? '',
            DateCreated: timestamp,
            DateUpdated: timestamp,
            IsPublic: pj.IsPublic,
            ImportId: imp.Id
            // TODO: DateActive?
          };
        })
      );

      if (projects) {
        // Create products
        queues.scriptoria.addBulk(
          projects.map((p) => ({
            name: `Create Project #${p}`,
            data: {
              type: BullMQ.ScriptoriaJobType.Project_Create,
              projectId: p
            }
          }))
        );
      }
    }

    if (errors.length) {
      return fail(500, { form, ok: false, errors });
    }

    return { form, ok: true };
  }
};
