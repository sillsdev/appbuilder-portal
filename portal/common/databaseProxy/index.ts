import { Prisma, PrismaClient } from '@prisma/client';

import prisma from '../prisma.js';
import * as products from './Products.js';
import * as projects from './Projects.js';
import * as users from './Users.js';

// type PrismaTables = Pick<InstanceType<typeof PrismaClient>, Uncapitalize<Prisma.ModelName>>;
// export class DefaultProxy<T extends PrismaTables[keyof PrismaTables]> {
//   constructor(private prismaTable: T) {}
//   delete(where: Prisma.Args<T, 'delete'>["where"]) {
//     this.prismaTable.delete()
//   }
// }

type DataType = {
  [K in keyof typeof Prisma.ModelName as Uncapitalize<K>]: /*DefaultProxy<*/ InstanceType<
    typeof PrismaClient
  >[Uncapitalize<K>];
};

const handlers = {
  products,
  projects,
  users
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
