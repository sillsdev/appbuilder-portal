import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import { AdminSettings } from '$lib/admin-settings';

export async function update(
  userId: number,
  data: Record<Prisma.AdminSettingsCreateInput['Key'], Prisma.AdminSettingsCreateInput['Value']>
) {
  return await prisma.$transaction(async (tx) => {
    const existing = new Map(
      (
        await tx.adminSettings.findMany({
          where: { Key: { in: Object.keys(data) } },
          select: { Key: true, Value: true }
        })
      ).map(({ Key, Value }) => [Key, Value])
    );

    return await Promise.all(
      Object.entries(data)
        .filter(([Key, Value]) => existing.has(Key) && existing.get(Key) !== Value)
        .map(([Key, Value]) =>
          tx.adminSettings.update({ where: { Key }, data: { Value, ModifiedById: userId } })
        )
    );
  });
}

export async function insertPlaceholders() {
  return await prisma.adminSettings.createMany({
    data: Object.values(AdminSettings).map((v) => ({
      Key: v.Key,
      Value: '{}',
      ModifiedById: null
    })),
    skipDuplicates: true
  });
}
