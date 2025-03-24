import * as v from 'valibot';

export const idSchema = v.pipe(v.number(), v.minValue(0), v.integer());
