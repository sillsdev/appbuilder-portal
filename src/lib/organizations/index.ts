import * as v from 'valibot';
import { requiredString } from '$lib/valibot';

export const infoSchema = v.object({
  name: requiredString,
  logoUrl: v.nullable(v.string()),
  contact: v.nullable(
    v.union([
      v.pipe(
        v.literal(''),
        v.transform(() => null)
      ),
      v.pipe(v.string(), v.email())
    ])
  )
});

export const infrastructureSchema = v.object({
  buildEngineUrl: v.nullable(v.string()),
  buildEngineApiAccessToken: v.nullable(v.string()),
  useDefaultBuildEngine: v.boolean()
});

export const organizationBaseSchema = v.object({
  ...infoSchema.entries,
  ...infrastructureSchema.entries,
  websiteUrl: v.nullable(v.string()),
  publicByDefault: v.boolean()
});
