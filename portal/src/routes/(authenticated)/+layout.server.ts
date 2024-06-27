import prisma, { getOrganizationsForUser } from '$lib/prisma';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  const userId = (await event.locals.auth())!.user.userId;
  const numberOfTasks = await prisma.userTasks.count({
    where: {
      UserId: userId
    }
  });
  const organizations = await getOrganizationsForUser(userId);
  return { organizations, numberOfTasks };
};
