import * as v from 'valibot';

export const idSchema = v.pipe(v.number(), v.minValue(0), v.integer());

export const langtagsSchema = v.array(v.object({
  tag: v.string(),
  localname: v.optional(v.string()),
  name: v.string()
}));

export type Langtags = v.InferOutput<typeof langtagsSchema>;
