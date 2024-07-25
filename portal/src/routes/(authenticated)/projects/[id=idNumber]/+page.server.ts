import prisma, { RoleId, idSchema } from '$lib/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { PageServerLoad } from './$types';

const addAuthorSchema = v.object({
  author: idSchema
});
const addReviewerSchema = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  language: v.string()
});

export const load = (async ({ params }) => {
  const project = await prisma.projects.findUnique({
    where: {
      Id: parseInt(params.id)
    },
    include: {
      ApplicationType: true,
      Products: {
        include: {
          ProductDefinition: true
        }
      },
      Owner: true,
      Group: true,
      Authors: {
        include: {
          Users: true
        }
      },
      Reviewers: true
    }
  });
  // All users who are members of the group and have the author role in the project's organization
  // May be a more efficient way to search this, by referencing group memberships instead of users
  const authorsToAdd = await prisma.users.findMany({
    where: {
      GroupMemberships: {
        some: {
          GroupId: project?.GroupId
        }
      },
      UserRoles: {
        some: {
          OrganizationId: project?.OrganizationId,
          RoleId: RoleId.Author
        }
      }
    }
  });
  const authorForm = await superValidate(valibot(addAuthorSchema));
  const reviewerForm = await superValidate(valibot(addReviewerSchema));
  return { project, authorsToAdd, authorForm, reviewerForm };
}) satisfies PageServerLoad;
