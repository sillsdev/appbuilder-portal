import * as v from 'valibot';

const whitelist = v.optional(v.union([v.array(v.number()), v.picklist(['all'])]), []);

export const SiteParamSchemas = {
  'software-updates': v.strictObject({
    'rate-limit': v.optional(v.number(), 20),
    'allow-orgs': whitelist
  }),
  projects: v.strictObject({
    'org-show-repo-url': whitelist
  })
} as const;

export type SiteParams = keyof typeof SiteParamSchemas;

export type SiteParamValueKey<P extends SiteParams> = keyof v.InferOutput<
  (typeof SiteParamSchemas)[P]
>;

export type SiteParamValue<P extends SiteParams, K extends SiteParamValueKey<P>> = v.InferOutput<
  (typeof SiteParamSchemas)[P]
>[K];
