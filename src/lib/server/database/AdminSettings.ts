import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import { SiteParamSchemas } from '$lib/valibot';

export async function updateMany(
  userId: number | null,
  params: Prisma.AdminSettingsGetPayload<{ select: { Key: true; Value: true } }>[]
) {
  return await prisma.$transaction(async (tx) => {
    const existing = new Map(
      (
        await tx.adminSettings.findMany({
          where: { Key: { in: params.map((p) => p.Key) } },
          select: { Key: true, Value: true }
        })
      ).map(({ Key, Value }) => [Key, Value])
    );

    return await Promise.all(
      params
        .filter(({ Key, Value }) => !existing.has(Key) || existing.get(Key) !== Value)
        .map(({ Key, Value }) =>
          tx.adminSettings.upsert({
            where: { Key },
            create: { Key, Value, ModifiedById: userId },
            update: { Value, ModifiedById: userId }
          })
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
