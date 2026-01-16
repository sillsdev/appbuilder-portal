import prisma from './prisma';

export const create = prisma.productDefinitions.create;
export const update = prisma.productDefinitions.update;

export async function setApplicationTypes(Id: number, ApplicationTypes: number[]) {
  return await prisma.productDefinitions.update({
    where: {
      Id
    },
    data: {
      ApplicationTypes: {
        connect: ApplicationTypes.map((n) => ({ Id: n })),
        disconnect: (await prisma.applicationTypes.findMany({ select: { Id: true } })).filter(
          (at) => !ApplicationTypes.includes(at.Id)
        )
      }
    },
    select: {
      Id: true,
      ApplicationTypes: {
        select: {
          Id: true
        }
      }
    }
  });
}
