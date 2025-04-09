import * as v from 'valibot';

export const idSchema = v.pipe(v.number(), v.minValue(0), v.integer());

const recordSchema = v.record(v.string(), v.string());

export const propertiesSchema = v.nullable(
  v.pipe(
    v.string(),
    // make sure it is valid JSON
    v.rawTransform(({ dataset, addIssue, NEVER }) => {
      try {
        return JSON.parse(dataset.value || '{}');
      } catch (e) {
        //console.warn(e);
        addIssue({
          message: e as string,
          path: [{
            type: 'unknown',
            origin: 'value',
            input: dataset.value,
            key: 'root',
            value: dataset.value
          }]
        });
        return NEVER;
      }
    }),
    // make sure it has the right structure
    v.strictObject({
      environment: v.optional(recordSchema),
      'build:environment': v.optional(recordSchema),
      'publish:environment': v.optional(recordSchema),
      'build:targets': v.optional(v.string()),
      'publish:targets': v.optional(v.string())
    }),
    // transform it back into a string (huzzah!)
    v.transform((o) => JSON.stringify(o, null, 4))
  )
);
