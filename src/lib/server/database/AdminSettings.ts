import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import { SiteParamSchemas, type SiteParams } from '$lib/site-params';

export async function updateMany(
  userId: number | null,
  data: Partial<Record<SiteParams, Prisma.AdminSettingsCreateInput['Value']>>
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
    data: Object.keys(SiteParamSchemas).map((v) => ({
      Key: v,
      Value: '{}',
      ModifiedById: null
    })),
    skipDuplicates: true
  });
}
