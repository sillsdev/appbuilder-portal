import type { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

import * as authors from './Authors';
import * as groups from './Groups';
import * as organizations from './Organizations';
import * as productDefinitions from './ProductDefinitions';
import * as productTransitions from './ProductTransitions';
import * as products from './Products';
import * as projects from './Projects';
import type { WRITE_METHODS } from './ReadonlyPrisma';
import * as reviewers from './Reviewers';
import * as stores from './Stores';
import * as userTasks from './UserTasks';
import * as users from './Users';
import * as workflowInstances from './WorkflowInstances';
import prisma from './prisma';

export * from './prisma';

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
  authors,
  reviewers,
  products,
  projects,
  groups,
  userTasks,
  stores,
  productDefinitions,
  organizations,
  productTransitions,
  users,
  workflowInstances
};
// @ts-expect-error this is in fact immediately populated
const obj: DataType = {};
for (const prop in Prisma.ModelName) {
  const uncapitalized = prop[0].toLowerCase() + prop.substring(1);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  obj[uncapitalized] = prisma[uncapitalized];
}

export const DatabaseWrites = {
  ...obj,
  ...handlers
};
