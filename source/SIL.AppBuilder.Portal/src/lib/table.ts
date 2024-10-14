import * as v from 'valibot';

export const tableSchema = v.object({
  page: v.number(),
  size: v.number(),
  sort: v.nullable(v.array(v.object({
    field: v.string(),
    direction: v.picklist(['asc', 'desc'])
  }))),
  search: v.object({
    field: v.nullable(v.string()),
    text: v.nullable(v.string())
  })
});

export type TableSchema = typeof tableSchema;