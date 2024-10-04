import prisma from '../prisma.js';

export async function update(): Promise<never> {
  throw new Error('Not implemented');
}
export async function deleteGroup(id: number) {
  if (
    await prisma.projects.findFirst({
      where: {
        GroupId: id
      }
    })
  )
    return false;
  await prisma.groups.delete({ where: { Id: id } });
  return true;
}
export async function createGroup(name: string, abbreviation: string, organization: number) {
  await prisma.groups.create({
    data: {
      OwnerId: organization,
      Name: name,
      Abbreviation: abbreviation
    }
  });
  return true;
}
