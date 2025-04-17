import { idSchema } from '$lib/valibot';
import * as v from 'valibot';

export const infoSchema = v.object({
  name: v.nullable(v.string()),
  logoUrl: v.nullable(v.string())
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
  publicByDefault: v.boolean(),
  owner: idSchema
});