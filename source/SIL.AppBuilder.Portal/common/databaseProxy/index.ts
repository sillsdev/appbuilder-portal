import { Prisma, PrismaClient } from '@prisma/client';

import { WRITE_METHODS } from '../ReadonlyPrisma.js';
import prisma from '../prisma.js';
import * as groupMemberships from './GroupMemberships.js';
import * as groups from './Groups.js';
import * as products from './Products.js';
import * as projects from './Projects.js';
import * as utility from './utility.js';

type RecurseRemove<T, V> = {
  [K in keyof T]: T[K] extends V | null | undefined ? never : RecurseRemove<T[K], V>;
};

type RemoveNested<
  T extends InstanceType<typeof PrismaClient>[Uncapitalize<keyof typeof Prisma.ModelName>]
> = {
  [K in keyof T]: K extends (typeof WRITE_METHODS)[number]
    ? (
        args: RecurseRemove<Parameters<T[K]>[0], { connect?: unknown; create?: unknown }>
      ) => ReturnType<T[K]>
    : T[K];
};

type DataType = {
  [K in keyof typeof Prisma.ModelName as Uncapitalize<K>]: /*DefaultProxy<*/ RemoveNested<
    InstanceType<typeof PrismaClient>[Uncapitalize<K>]
  >;
};

const handlers = {
  products,
  projects,
  groups,
  groupMemberships,
  utility
};
// @ts-expect-error this is in fact immediately populated
const obj: DataType = {};
for (const prop in Prisma.ModelName) {
  const uncapitalized = prop[0].toLowerCase() + prop.substring(1);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  obj[uncapitalized] = prisma[uncapitalized];
}

export default {
  ...obj,
  ...handlers
} as const;
