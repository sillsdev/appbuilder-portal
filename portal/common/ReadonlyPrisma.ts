// Credit to https://github.com/prisma/prisma-client-extensions/blob/main/readonly-client/script.ts

import { Prisma } from '@prisma/client';

export const WRITE_METHODS = [
  'create',
  'update',
  'upsert',
  'delete',
  'createMany',
  'updateMany',
  'deleteMany'
] as const;

export const ReadonlyClient = Prisma.defineExtension({
  name: 'ReadonlyClient',
  model: {
    $allModels: Object.fromEntries(
      WRITE_METHODS.map((method) => [
        method,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function (args: never) {
          throw new Error(`Calling the \`${method}\` method on a readonly client is not allowed`);
        }
      ])
    ) as {
      [K in (typeof WRITE_METHODS)[number]]: (
        args: `Calling the \`${K}\` method on a readonly client is not allowed`
      ) => never;
    }
  }
});
