import * as v from 'valibot';

export const paginateSchema = v.object({
  page: v.number(),
  size: v.number()
});

export type PaginateSchema = typeof paginateSchema;