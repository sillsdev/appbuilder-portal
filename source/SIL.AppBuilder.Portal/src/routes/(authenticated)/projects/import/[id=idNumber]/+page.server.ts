import { importJSONSchema } from '$lib/projects/common';
import { verifyCanCreateProject } from '$lib/projects/common.server';
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
    valibot(projectsImportSchema),
    { errors: false }
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
      return fail(400, { form, ok: false, errors: form.errors });
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
    try {
      const errors: {
        path: string;
        messages: string[];
      }[] = [];

      await Promise.all(
        form.data.json.Products.map(async (p, i) => {
          const pdi = (
            await prisma.productDefinitions.findFirst({
              where: {
                Name: p.Name,
                OrganizationProductDefinitions: {
                  some: {
                    OrganizationId: organizationId
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
            errors.push({
              path: `json.Products[${i}].Name`,
              messages: [
                `Could not find ProductDefinition: "${p.Name}" for Organization: ${organization.Name}`
              ]
            });
          }

          const si = (
            await prisma.stores.findFirst({
              where: {
                Name: p.Store,
                OrganizationStores: {
                  some: {
                    OrganizationId: organizationId
                  }
                }
              },
              select: {
                Id: true
              }
            })
          )?.Id;

          if (si === undefined) {
            // TODO: better errors
            errors.push({
              path: `json.Products[${i}].Store`,
              messages: [
                `Could not find Store: "${p.Store}" for Organization: ${organization.Name}`
              ]
            });
          }
          return {
            ProductDefinitionId: pdi,
            StoreId: si
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
          form.data.json.Projects.map((pj) => {
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

      return redirect(302, `/projects/own/${organizationId}`);
    } catch (e) {
      if (e instanceof v.ValiError) return { form, ok: false, errors: e.issues };
      throw e;
    }
  }
};
