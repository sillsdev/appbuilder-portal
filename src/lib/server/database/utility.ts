import type { PrismaClient } from '@prisma/client';
import type { ITXClientDenyList } from '@prisma/client/runtime/client';

type Primitive = string | number | boolean | Date;
export type RequirePrimitive<T> = {
  [K in keyof T]: Extract<T[K], Primitive | null | undefined | Primitive[]>;
};

export type TXClient = Omit<PrismaClient, ITXClientDenyList>;
