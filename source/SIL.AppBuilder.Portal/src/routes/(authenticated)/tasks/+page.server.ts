import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  const tasks = await prisma.userTasks.findMany({
    where: {
      UserId: session?.user.userId
    },
    include: {
      Product: {
        include: {
          Project: true,
          ProductDefinition: {
            include: {
              Workflow: true
            }
          }
        }
      }
    }
  });
  return { tasks };
};
