import * as v from 'valibot';

export const idSchema = v.pipe(v.number(), v.minValue(0), v.integer());

/** mostly for product IDs */
export const stringIdSchema = v.pipe(v.string(), v.uuid());

export const deleteSchema = v.object({
  id: idSchema
});

export const paginateSchema = v.object({
  page: v.number(),
  size: v.number()
});

export type PaginateSchema = typeof paginateSchema;

const recordSchema = v.record(v.string(), v.string());

export const propertiesSchema = v.nullable(
  v.pipe(
    v.string(),
    // make sure it is valid JSON
    v.rawTransform(({ dataset, addIssue, NEVER }) => {
      try {
        return JSON.parse(dataset.value || '{}');
      } catch (e) {
        addIssue({
          message: e instanceof Error ? e.message : String(e),
          path: [
            {
              type: 'unknown',
              origin: 'value',
              input: dataset.value,
              key: 'root',
              value: dataset.value
            }
          ]
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

/** Legal phone numbers: +1 (123) 456-7890 1234567890 123-4567890 123 456-7890 */
// eslint-disable-next-line no-useless-escape
export const phoneRegex = new RegExp(/[\d\(\) \-+]{0,24}/); // arbitrary max-length for phone number

//language tag regex sourced from: https://stackoverflow.com/a/60899733
export const langtagRegex = new RegExp(
  '^(' +
    '(' + // grandfathered
    /* irregular */ '(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)' +
    '|' +
    /* regular */ '(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang)' +
    ')' +
    '|' + // langtag
    '(' +
    '(' +
    //language
    ('([A-Za-z]{2,3}(-' +
      //extlang
      '([A-Za-z]{3}(-[A-Za-z]{3}){0,2})' +
      ')?)|[A-Za-z]{4}|[A-Za-z]{5,8})') +
    '(-' +
    '([A-Za-z]{4})' +
    ')?' + //script
    '(-' +
    '([A-Za-z]{2}|[0-9]{3})' +
    ')?' + //region
    '(-' +
    '([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3})' +
    ')*' + //variant
    //extension
    '(-' +
    '(' +
    /* singleton */ ('[0-9A-WY-Za-wy-z]' + '(-[A-Za-z0-9]{2,8})+)') +
    ')*' +
    '(-' +
    '(x(-[A-Za-z0-9]{1,8})+)' +
    ')?' + //private use
    ')' +
    '|' +
    '(x(-[A-Za-z0-9]{1,8})+)' +
    ')$'
);

/**
 * converts a RegExp into a string that is usable by HTML native input validation using a pattern
 */
export function regExpToInputPattern(re: RegExp) {
  return re.toString().slice(1, -1);
}
