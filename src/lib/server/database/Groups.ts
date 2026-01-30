import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';

export async function update(
  Id: number,
  data: RequirePrimitive<Prisma.GroupsUncheckedUpdateInput>
) {
  return prisma.groups.update({
    where: { Id },
    data
  });
}
/** @returns false if the group is associated with at least one project. */
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
export async function createGroup(
  name: string,
  description: string,
  organization: number,
  users: number[]
) {
  return prisma.groups.create({
    data: {
      OwnerId: organization,
      Name: name,
      Description: description,
      Users: {
        connect: await prisma.users.findMany({
          where: { Id: { in: users }, Organizations: { some: { Id: organization } } },
          select: {
            Id: true
          }
        })
      }
    },
    select: {
      Id: true
    }
  });
}
